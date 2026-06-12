export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { url, payload, headers } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, error: 'Missing Webhook URL' });
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
