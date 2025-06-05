import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env.local 명시적으로 로드
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const PORT = 5174;

const headers = {
  'x-ncp-apigw-api-key-id': process.env.VITE_NCP_CLIENT_ID,
  'x-ncp-apigw-api-key': process.env.VITE_NCP_CLIENT_SECRET
};

// ✅ 1. 위도/경도 → 주소
app.get('/api/reverse-geocode', async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const response = await fetch(
      `https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lng},${lat}&output=json&orders=legalcode,admcode,addr,roadaddr&output=xml`,
      { headers }
    );

    const data = await response.json();

    // 네이버에서 에러 내려준 경우 체크
    if (data.error) {
      console.error('❌ Naver API Error:', data.error);
      return res.status(500).json({ message: 'Naver API Error', detail: data.error });
    }

    res.json(data);
  } catch (err) {
    console.error('❌ Proxy Server Error:', err);
    res.status(500).json({ message: 'Proxy Server Error', detail: err.message });
  }
});

// ✅ 2. 주소 → 위도/경도 (Forward Geocode)
app.get('/api/forward-geocode', async (req, res) => {
  const { query } = req.query;

  try {
    const response = await fetch(
      `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`,
      { headers }
    );

    const data = await response.json();

    if (data.error) {
      console.error('❌ Forward Geocode API Error:', data.error);
      return res.status(500).json({ message: 'Forward Geocode API Error', detail: data.error });
    }

    res.json(data);
  } catch (err) {
    console.error('❌ Proxy Server Error:', err);
    res.status(500).json({ message: 'Proxy Server Error', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running at http://localhost:${PORT}`);
});
