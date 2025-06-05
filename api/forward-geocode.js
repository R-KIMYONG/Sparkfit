export default async function handler(req, res) {
  const { query } = req.query;

  const headers = {
    'x-ncp-apigw-api-key-id': process.env.VITE_NCP_CLIENT_ID,
    'x-ncp-apigw-api-key': process.env.VITE_NCP_CLIENT_SECRET
  };

  try {
    const response = await fetch(
      `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`,
      { headers }
    );

    const data = await response.json();

    if (data.error) {
      console.error('forward Geocode API Error:', data.error);
      return res.status(500).json({ message: 'Forward Geocode API Error', detail: data.error });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('serverless Proxy Error:', err);
    res.status(500).json({ message: 'Serverless Proxy Error', detail: err.message });
  }
}
