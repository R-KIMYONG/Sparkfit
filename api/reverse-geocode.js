export default async function handler(req, res) {
  const { lat, lng } = req.query;

  const headers = {
    'x-ncp-apigw-api-key-id': process.env.VITE_NCP_CLIENT_ID,
    'x-ncp-apigw-api-key': process.env.VITE_NCP_CLIENT_SECRET
  };

  try {
    const response = await fetch(
      `https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lng},${lat}&output=json&orders=legalcode,admcode,addr,roadaddr`,
      { headers }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Naver API Error:', data.error);
      return res.status(500).json({ message: '네이버 지도 API 오류', detail: data.error });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Serverless Proxy Error:', err);
    res.status(500).json({ message: '서버리스 프록시 오류', detail: err.message });
  }
}
