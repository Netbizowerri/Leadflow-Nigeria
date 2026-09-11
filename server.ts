/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { lookup } from "node:dns/promises";
import { getUserFromRequest } from "./auth";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini if key exists
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({ apiKey: geminiApiKey });
  console.log("Initialized Gemini AI Client on server.");
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
}

// -------------------------------------------------------------
// Helper: Format phone numbers to Nigerian (+234) format
// -------------------------------------------------------------
function normalizeNigerianPhone(phone: string): string {
  if (!phone) return "";
  let clean = phone.replace(/[\s\-\(\)]/g, "");
  
  // Handled leading 0 or direct values
  if (clean.startsWith("+234")) return clean;
  if (clean.startsWith("234") && clean.length >= 13) return "+" + clean;
  if (clean.startsWith("0")) {
    return "+234" + clean.substring(1);
  }
  // Standard Lagos office line or shorthand
  if (clean.length === 7 || clean.length === 8) {
    return "+2341" + clean; // Add Lagos area code 1
  }
  return phone; // Return original if unclear
}

// -------------------------------------------------------------
// Helper: Reject private/loopback/link-local IPs (SSRF guard)
// -------------------------------------------------------------
function isPrivateIp(ip: string): boolean {
  let addr = ip.toLowerCase();
  const v4mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(addr);
  if (v4mapped) addr = v4mapped[1];

  if (addr.includes(":")) {
    if (addr === "::" || addr === "::1") return true;
    if (addr.startsWith("fe80:") || addr.startsWith("fc") || addr.startsWith("fd")) return true;
    return false;
  }

  const octets = addr.split(".").map(Number);
  if (octets.length !== 4) return true;
  const [a, b] = octets;
  if (a === 0) return true;                                        // 0.0.0.0/8
  if (a === 10) return true;                                       // 10.0.0.0/8
  if (a === 100 && b >= 64 && b <= 127) return true;               // 100.64.0.0/10
  if (a === 127) return true;                                      // 127.0.0.0/8
  if (a === 169 && b === 254) return true;                         // 169.254.0.0/16
  if (a === 172 && b >= 16 && b <= 31) return true;                // 172.16.0.0/12
  if (a === 192 && b === 168) return true;                         // 192.168.0.0/16
  return false;
}

// -------------------------------------------------------------
// API: Webhook Proxy to bypass potential browser CORS blockages
// -------------------------------------------------------------
app.post("/api/proxy-webhook", async (req, res) => {
  const auth = await getUserFromRequest(req.headers.authorization);
  if (!auth.ok) {
    return res.status(401).json({ success: false, error: auth.error || "Unauthorized" });
  }

  const { url, payload, headers } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: "Missing Webhook URL" });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(String(url).trim());
  } catch {
    return res.status(400).json({ success: false, error: "Invalid Webhook URL format" });
  }
  if (parsedUrl.protocol !== "https:") {
    return res.status(400).json({ success: false, error: "Webhook URL must use HTTPS" });
  }
  const hostname = parsedUrl.hostname.toLowerCase();

  // Resolve hostname to IPs and block any private/loopback/link-local target
  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (addresses.length === 0) throw new Error("No addresses");
    if (addresses.some(({ address }) => isPrivateIp(address))) {
      return res.status(400).json({ success: false, error: "Webhook URL must not point to private or local network" });
    }
  } catch {
    return res.status(400).json({ success: false, error: "Webhook URL hostname could not be resolved" });
  }

  try {
    const formattedHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: formattedHeaders,
        body: JSON.stringify(payload),
        redirect: "manual",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      return res.status(400).json({ success: false, error: "Webhook URL must not redirect — redirects are blocked" });
    }

    const responseText = await response.text();
    let parsedData = null;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = responseText;
    }

    if (response.ok) {
      return res.json({ success: true, status: response.status, data: parsedData });
    } else {
      return res.status(response.status).json({
        success: false,
        error: `Target server responded with status ${response.status}`,
        details: parsedData,
      });
    }
  } catch (err: any) {
    console.error("Webhook proxy error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to reach webhook URL" });
  }
});

// -------------------------------------------------------------
// API: Lead Searcher Engine (Nigerian Directories via Gemini)
// -------------------------------------------------------------
app.post("/api/search", async (req, res) => {
  const auth = await getUserFromRequest(req.headers.authorization);
  if (!auth.ok) {
    return res.status(401).json({ error: auth.error || "Unauthorized" });
  }

  const { query, location, source } = req.body;

  if (!query || !location) {
    return res.status(400).json({ error: "Query and location are required parameters" });
  }

  const sanitizedQuery = String(query).trim().replace(/[\x00-\x1F]/g, '').slice(0, 100);
  const sanitizedLocation = String(location).trim().replace(/[\x00-\x1F]/g, '').slice(0, 100);

  if (!sanitizedQuery || !sanitizedLocation) {
    return res.status(400).json({ error: "Query and location must be non-empty after sanitization" });
  }

  const safeSource = typeof source === "string" ? source.trim() : "";
  const enrichmentEnabled = req.body.useGeminiEnrichment === undefined ? true : Boolean(req.body.useGeminiEnrichment);

  // --------------------------------------------------------------------------
  // PATH: NIGERIAN DIRECTORIES (VConnect, BusinessList.com.ng)
  // --------------------------------------------------------------------------
  if (safeSource === "Nigerian Directories" || safeSource === "VConnect" || safeSource === "BusinessList") {
    if (!ai) {
      return res.status(400).json({
        error: "Missing Server GEMINI_API_KEY. Please ensure your AI Studio Secrets include 'GEMINI_API_KEY'.",
      });
    }

    try {
      console.log("Scraping Nigerian Directories via Gemini Grounded Engine...");
      
      const directorySource = safeSource === "Nigerian Directories" ? "VConnect, BusinessList.com.ng, and YellowPages Nigeria" : safeSource;
      const prompt = `
        ---BEGIN INSTRUCTION---
        Search real directories such as ${directorySource} for businesses.
        ---END INSTRUCTION---
        ---BEGIN USER INPUT---
        Sector: "${sanitizedQuery}"
        Location: "${sanitizedLocation}", Nigeria
        ---END USER INPUT---

        Your aim is to discover real, verified businesses that DO NOT have an official professional website (custom domain .com, .ng, etc.), but have listed contact details like phone number and/or email address.
        
        Retrieve 10 to 15 real listings.
        
        For each business, provide:
        1. "name": The exact registered business name.
        2. "phone": A valid active Nigerian phone number (normalized to +234 format, e.g. +234803xxxxxxx).
        3. "email": ${enrichmentEnabled ? "Discover their email address. If they have none, provide a logical null." : "Do not attempt email discovery. Always return null."}
        4. "address": Physical address/landmark.
        5. "rating": Average rating from directories or Map reviews (estimate between 3.5 and 5.0 or null).
        6. "category": Simple title category (e.g. Real Estate Agent, School).
        7. "source": Which directory you found it on ("VConnect", "BusinessList", etc.).
        8. "notes": Notes about their physical business site, VConnect page URL, or what website layouts they are missing.
        
        Respond ONLY with a valid JSON array of objects. Do not wrap in markdown tags or include any preamble.
        JSON format:
        [
          {
            "id": "dir-[unique-slug-or-id]",
            "name": "Elegance Homes",
            "phone": "+2348123456789",
            "email": "elegancehomes@gmail.com",
            "address": "Herbert Macaulay, Lagos",
            "rating": 4.1,
            "category": "Real Estate Agency",
            "source": "BusinessList",
            "notes": "Listed on BusinessList since 2021. Active Facebook page. Needs landing page."
          }
        ]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const responseText = response.text;
      if (!responseText) {
        return res.json({ leads: [] });
      }

      const cleaned = responseText.trim().replace(/^```(?:json)?\s*|```\s*$/g, '');
      let parsedLeads = JSON.parse(cleaned);
      if (Array.isArray(parsedLeads)) {
        // Enforce normalization & standard fields
        parsedLeads = parsedLeads.map((item: any, i: number) => {
          return {
            id: item.id || `directory-${source}-${Date.now()}-${i}`,
            name: item.name || "Unknown Business",
            phone: normalizeNigerianPhone(item.phone || ""),
            email: item.email || null,
            address: item.address || `Lagos, Nigeria`,
            rating: item.rating || null,
            userRatingsTotal: Math.floor(Math.random() * 20) + 1,
            category: item.category || sanitizedQuery,
            status: "New",
            source: item.source || source,
            notes: item.notes || "No website found. Found listed on local directory.",
            dateAdded: new Date().toISOString(),
          };
        }).filter((item: any) => item.phone && item.phone.length > 5);

        return res.json({ leads: parsedLeads });
      } else {
        throw new Error("Gemini returned invalid scraper schema format.");
      }
    } catch (err: any) {
      console.error("Directory search fail:", err);
      return res.status(500).json({ error: err.message || "Failed to parse directory results" });
    }
  }

  // Fallback
  return res.status(400).json({ error: "Invalid search configuration" });
});

// -------------------------------------------------------------
// Serve Application Frontend
// -------------------------------------------------------------
const startWebServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode with Vite Middleware.
    // Attach Vite's HMR WebSocket to the same Express HTTP server so it connects
    // on port 3000 (same-origin), otherwise Vite binds a random free port which
    // the index.html CSP `connect-src 'self'` blocks — breaking HMR full-reloads.
    const httpServer = app.listen(PORT, "0.0.0.0");

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: "spa",
    });

    app.use(vite.middlewares);

    httpServer.on("listening", () => {
      console.log(`LeadFlow Nigeria running on http://0.0.0.0:${PORT}`);
    });
  } else {
    // Production Mode with pre-built static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`LeadFlow Nigeria running on http://0.0.0.0:${PORT}`);
    });
  }
};

startWebServer();
