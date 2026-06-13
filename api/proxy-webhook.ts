export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { url, payload, headers } = req.body;

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
  const blockedPatterns = [
    'localhost', '127.0.0.1', '0.0.0.0', '::1',
    '10.', '172.16.', '172.17.', '172.18.', '172.19.',
    '172.20.', '172.21.', '172.22.', '172.23.', '172.24.',
    '172.25.', '172.26.', '172.27.', '172.28.', '172.29.',
    '172.30.', '172.31.', '192.168.',
  ];
  if (blockedPatterns.some(p => hostname.startsWith(p) || hostname === p)) {
    return res.status(400).json({ success: false, error: 'Webhook URL must not point to private or local network' });
  }

  try {
    const formattedHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: formattedHeaders,
      body: JSON.stringify(payload),
    });

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
