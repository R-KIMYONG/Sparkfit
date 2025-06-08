// export default async function handler(req, res) {
//   const { query } = req.query;

//   const headers = {
//     'x-ncp-apigw-api-key-id': process.env.VITE_NCP_CLIENT_ID,
//     'x-ncp-apigw-api-key': process.env.VITE_NCP_CLIENT_SECRET
//   };

//   try {
//     const response = await fetch(
//       `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`,
//       { headers }
//     );

//     const data = await response.json();

//     if (data.error) {
//       console.error('forward Geocode API Error:', data.error);
//       return res.status(500).json({ message: 'Forward Geocode API Error', detail: data.error });
//     }

//     res.status(200).json(data);
//   } catch (err) {
//     console.error('serverless Proxy Error:', err);
//     res.status(500).json({ message: 'Serverless Proxy Error', detail: err.message });
//   }
// }

export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  const headers = req.headers;
  if (!headers || typeof headers.get !== 'function') {
    return new Response(JSON.stringify({ error: 'Invalid request headers' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let fullUrl;
  try {
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    fullUrl = `${protocol}://${host}${req.url}`;
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Malformed request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { searchParams } = new URL(fullUrl);
  const query = searchParams.get('query');

  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const NAVER_CLIENT_ID = process.env.VITE_NCP_CLIENT_ID;
  const NAVER_CLIENT_SECRET = process.env.VITE_NCP_CLIENT_SECRET;

  const response = await fetch(
    `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`,
    {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET
      },
      next: { revalidate: 60 } // 선택적 캐싱
    }
  );

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
