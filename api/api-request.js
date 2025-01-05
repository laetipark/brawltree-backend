require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// GET 요청 처리
app.get('/api/data', (req, res) => {
  const request = req.query;

  async function fetchData(url){
    try{
      const response = await fetch(url, {
        method: 'GET', // 또는 'POST', 'PUT', 'DELETE' 등
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_KEY}` // API 키를 헤더에 추가
        }
      });

      if(!response.ok){
        console.error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    }catch (error){
      console.error('Error fetching data:', error);
    }
  }

  // /rankings/global/players
  fetchData(`https://api.brawlstars.com/v1/${request.query}`)
    .then(data => {
      res.send(data);
    })
    .catch(error => console.error('Error:', error));
});

// 서버 시작
app.listen(port, () => {
  console.log(`🌸 | Plant Brawl Tree at ${port}`);
});