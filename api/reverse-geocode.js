// export default async function handler(req, res) {
//   const { lat, lng } = req.query;

//   const headers = {
//     'x-ncp-apigw-api-key-id': process.env.VITE_NCP_CLIENT_ID,
//     'x-ncp-apigw-api-key': process.env.VITE_NCP_CLIENT_SECRET
//   };

//   try {
//     const response = await fetch(
//       `https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lng},${lat}&output=json&orders=legalcode,admcode,addr,roadaddr`,
//       { headers }
//     );

//     const data = await response.json();

//     if (data.error) {
//       console.error('Naver API Error:', data.error);
//       return res.status(500).json({ message: '네이버 지도 API 오류', detail: data.error });
//     }

//     res.status(200).json(data);
//   } catch (err) {
//     console.error('Serverless Proxy Error:', err);
//     res.status(500).json({ message: '서버리스 프록시 오류', detail: err.message });
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
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return new Response(JSON.stringify({ error: 'Missing coordinates' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const NAVER_CLIENT_ID = process.env.VITE_NCP_CLIENT_ID;
  const NAVER_CLIENT_SECRET = process.env.VITE_NCP_CLIENT_SECRET;

  const response = await fetch(
    `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lng},${lat}&orders=roadaddr,addr&output=json`,
    {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET
      },
      next: { revalidate: 60 } // 선택: edge cache 사용 시
    }
  );

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}