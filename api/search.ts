import { GoogleGenAI } from '@google/genai';

const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({ apiKey: geminiApiKey });
}

function normalizeNigerianPhone(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[\s\-\(\)]/g, '');

  if (clean.startsWith('+234')) return clean;
  if (clean.startsWith('234') && clean.length >= 13) return '+' + clean;
  if (clean.startsWith('0')) {
    return '+234' + clean.substring(1);
  }
  if (clean.length === 7 || clean.length === 8) {
    return '+2341' + clean;
  }
  return phone;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, location, source } = req.body;

  if (!query || !location) {
    return res.status(400).json({ error: 'Query and location are required parameters' });
  }

  if (source === 'Nigerian Directories' || source === 'VConnect' || source === 'BusinessList') {
    if (!ai) {
      return res.status(400).json({
        error: "Missing Server GEMINI_API_KEY. Please ensure your Vercel environment includes 'GEMINI_API_KEY'.",
      });
    }

    try {
      const directorySource = source === 'Nigerian Directories' ? 'VConnect, BusinessList.com.ng, and YellowPages Nigeria' : source;
      const prompt = `
        Search real directories such as ${directorySource} for businesses inside the "${query}" sector located in "${location}", Nigeria.
        Your aim is to discover real, verified businesses that DO NOT have an official professional website (custom domain .com, .ng, etc.), but have listed contact details like phone number and/or email address.

        Retrieve 10 to 15 real listings.

        For each business, provide:
        1. "name": The exact registered business name.
        2. "phone": A valid active Nigerian phone number (normalized to +234 format, e.g. +234803xxxxxxx).
        3. "email": Discover their email address. If they have none, provide a logical null.
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
        model: 'gemini-2.5-flash',
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
        parsedLeads = parsedLeads.map((item: any, i: number) => ({
          id: item.id || `directory-${source}-${Date.now()}-${i}`,
          name: item.name || 'Unknown Business',
          phone: normalizeNigerianPhone(item.phone || ''),
          email: item.email || null,
          address: item.address || 'Lagos, Nigeria',
          rating: item.rating || null,
          userRatingsTotal: Math.floor(Math.random() * 20) + 1,
          category: item.category || query,
          status: 'New',
          source: item.source || source,
          notes: item.notes || 'No website found. Found listed on local directory.',
          dateAdded: new Date().toISOString(),
        })).filter((item: any) => item.phone && item.phone.length > 5);

        return res.json({ leads: parsedLeads });
      }

      throw new Error('Gemini returned invalid scraper schema format.');
    } catch (err: any) {
      console.error('Directory search fail:', err);
      return res.status(500).json({ error: err.message || 'Failed to parse directory results' });
    }
  }

  return res.status(400).json({ error: 'Invalid search configuration' });
}
