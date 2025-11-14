/* server.js - 백엔드 프록시 서버 코드 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // ◀◀◀ 1. .env 파일을 읽어오는 코드 추가

const app = express();
const PORT = process.env.PORT || 3000;

// process.env.PORT: "Render가 지정한 포트 번호가 있다면 그것을 사용해라." (배포 환경)
// || 3000: "만약 Render가 지정한 포트 번호가 없다면(예: 내 PC에서 로컬로 실행할 때), 3000번을 사용해라." (로컬 환경)


// 🚨🚨🚨
// 서비스 키를 여기에 '안전하게' 보관합니다.
// 이 파일은 서버에서만 실행되므로 외부에 노출되지 않습니다.
// 🚨🚨🚨
const SERVICE_KEY = process.env.SERVICE_KEY; // ◀◀◀ 2. .env 파일에서 서비스 키를 읽어옵니다.

const KOFA_API_URL = 'https://api.kcisa.kr/openapi/API_CIA_098/request';

// CORS 설정: http://localhost (혹은 127.0.0.1)에서 오는 요청을 허용합니다.
// (index.html 파일을 브라우저에서 열 때의 주소 기준)
app.use(cors());
// 🔽🔽🔽 [이 부분 추가] 🔽🔽🔽
// 1. 현재 폴더(.)의 정적 파일(index.html, style.css, script.js)을 제공
app.use(express.static('.')); 

// 🔼🔼🔼 [여기까지 추가] 🔼🔼🔼
// 프론트엔드(index.html)가 호출할 주소: http://localhost:3000/api/articles
app.get('/api/articles', async (req, res) => {
    
    // 프론트엔드에서 보낸 pageNo, numOfRows 값을 받습니다.
    const { pageNo, numOfRows } = req.query;

    if (!pageNo || !numOfRows) {
        return res.status(400).send('pageNo와 numOfRows는 필수 파라미터입니다.');
    }

    try {
        // 1. 실제 KCISA API에 보낼 파라미터 조립 (이때 serviceKey를 추가!)
        const params = {
            serviceKey: SERVICE_KEY,
            pageNo: pageNo,
            numOfRows: numOfRows
        };

        // 2. 백엔드 서버가 KCISA API에 대신 요청 보냄
        const apiResponse = await axios.get(KOFA_API_URL, { params });
       // 🔽🔽🔽 [이 부분이 수정되었습니다] 🔽🔽🔽
        // API가 JSON으로 응답했으므로, 우리 서버도 JSON으로 응답합니다.
        // (apiResponse.data에 이미 { response: ... } 객체가 들어있습니다)
        res.json(apiResponse.data);
        // 🔼🔼🔼 [여기까지 수정] 🔼🔼🔼
        

    } catch (error) {
        console.error('API 프록시 오류:', error.message);
        res.status(500).send('API 서버(KCISA)에서 오류가 발생했습니다.');
    }
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`✅ 백엔드 프록시 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log('이제 index.html 파일을 브라우저에서 여세요.');
});