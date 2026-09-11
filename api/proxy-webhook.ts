import { lookup } from 'node:dns/promises';
import { getUserFromRequest } from '../auth';

function isPrivateIp(ip: string): boolean {
  let addr = ip.toLowerCase();
  const v4mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(addr);
  if (v4mapped) addr = v4mapped[1];

  if (addr.includes(':')) {
    if (addr === '::' || addr === '::1') return true;
    if (addr.startsWith('fe80:') || addr.startsWith('fc') || addr.startsWith('fd')) return true;
    return false;
  }

  const octets = addr.split('.').map(Number);
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { url, payload, headers } = req.body;

  const auth = await getUserFromRequest(req.headers.authorization);
  if (!auth.ok) {
    return res.status(401).json({ success: false, error: auth.error || 'Unauthorized' });
  }

  if (!url) {
    return res.status(400).json({ success: false, error: 'Missing Webhook URL' });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(String(url).trim());
  } catch {
    return res.status(400).json({ success: false, error: 'Invalid Webhook URL format' });
  }

  if (parsedUrl.protocol !== 'https:') {
    return res.status(400).json({ success: false, error: 'Webhook URL must use HTTPS' });
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Resolve hostname to IPs and block any private/loopback/link-local target
  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (addresses.length === 0) throw new Error('No addresses');
    if (addresses.some(({ address }) => isPrivateIp(address))) {
      return res.status(400).json({ success: false, error: 'Webhook URL must not point to private or local network' });
    }
  } catch {
    return res.status(400).json({ success: false, error: 'Webhook URL hostname could not be resolved' });
  }

  try {
    const formattedHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: formattedHeaders,
        body: JSON.stringify(payload),
        redirect: 'manual',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      return res.status(400).json({ success: false, error: 'Webhook URL must not redirect — redirects are blocked' });
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
    }

    return res.status(response.status).json({
      success: false,
      error: `Target server responded with status ${response.status}`,
      details: parsedData,
    });
  } catch (err: any) {
    console.error('Webhook proxy error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to reach webhook URL' });
  }
}