/* script.js - [수정] UI/UX 개선 (페이지네이션, 스피너) */

document.addEventListener('DOMContentLoaded', () => {

    // HTML 요소들 선택
    const resultsContainer = document.getElementById('results-container');
    const spinner = document.getElementById('spinner');
    const paginationControls = document.getElementById('pagination-controls');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const pageInfo = document.getElementById('page-info');

    const MY_BACKEND_API_URL = '/api/articles'; // ◀◀◀ 상대 경로로 변경
    
    // 상태 관리 변수
    let currentPage = 1;
    let totalCount = 0;
    const itemsPerPage = 10;

    // 로딩 상태 제어 함수
    function showLoading(isLoading) {
        if (isLoading) {
            spinner.style.display = 'block';
            resultsContainer.innerHTML = ''; // 로딩 시작 시 기존 콘텐츠 삭제
            paginationControls.style.display = 'none'; // 로딩 중 페이지네이션 숨김
        } else {
            spinner.style.display = 'none';
            paginationControls.style.display = 'flex'; // 로딩 완료 후 표시
        }
    }

    // 페이지네이션 버튼 상태 업데이트
    function updatePagination() {
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        pageInfo.textContent = `페이지 ${currentPage} / ${totalPages}`;
        
        prevButton.disabled = (currentPage === 1);
        nextButton.disabled = (currentPage === totalPages);
    }

    // 데이터 표시 함수 (HTML 생성)
    function displayItems(items) {
        resultsContainer.innerHTML = ''; // 기존 내용 삭제

        if (items.length === 0) {
            resultsContainer.innerHTML = '<p>표시할 데이터가 없습니다.</p>';
            totalCount = 0;
            return;
        }

        items.forEach(item => {
            const title = item.TITLE || '제목 없음';
            const author = item.AUTHOR || '저자 정보 없음';
            const imageUrl = item.IMAGE_OBJECT;
            const articleUrl = item.URL;
            const gubun = item.GUBUN || '분류 없음';
            const issuedDate = item.ISSUED_DATE || '날짜 없음';

            // '카드' HTML 구조
            const articleElement = document.createElement('article');
            articleElement.className = 'article-card'; 

            let imageHtml = `<div class="card-image"><img src="https://via.placeholder.com/300x180.png?text=No+Image" alt="이미지 없음"></div>`;
            if (imageUrl && imageUrl !== 'http://www.kmdb.or.kr/images/none.gif') { 
                imageHtml = `<div class="card-image"><img src="${imageUrl}" alt="${title} 이미지"></div>`;
            }

            articleElement.innerHTML = `
                ${imageHtml}
                <div class="card-content">
                    <h3>${title}</h3>
                    <div class="details">
                        <span><strong>분류:</strong> ${gubun}</span>
                        <span><strong>저자:</strong> ${author}</span>
                        <span><strong>발행일:</strong> ${issuedDate}</span>
                    </div>
                    ${articleUrl ? `<a href="${articleUrl}" target="_blank" rel="noopener noreferrer">기사 원문 보기</a>` : ''}
                </div>
            `;
            
            resultsContainer.appendChild(articleElement);
        });
    }

    // API 호출 함수 (페이지 번호 사용)
    async function fetchArticles(pageNo) {
        showLoading(true);

        const queryParams = `?numOfRows=${itemsPerPage}&pageNo=${pageNo}`;
        const fullUrl = MY_BACKEND_API_URL + queryParams;

        try {
            const response = await fetch(fullUrl);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`백엔드 서버 오류: ${errorText} (상태: ${response.status})`);
            }

            const data = await response.json();

            const resultCode = data.response.header.resultCode;
            if (resultCode && resultCode !== '0000') { 
                const resultMsg = data.response.header.resultMsg;
                throw new Error(`API 오류: ${resultMsg} (코드: ${resultCode})`);
            }

            // 총 개수 업데이트
            totalCount = parseInt(data.response.body.totalCount || 0, 10);

            // item 데이터 배열로 정규화
            const itemsObject = data.response.body.items;
            const itemData = itemsObject ? itemsObject.item : null;
            let items = [];
            if (Array.isArray(itemData)) {
                items = itemData;
            } else if (itemData) {
                items = [itemData];
            }

            // 데이터 표시 및 페이지네이션 업데이트
            displayItems(items);
            updatePagination();

        } catch (error) {
            console.error('호출 중 오류 발생:', error);
            resultsContainer.innerHTML = `<p style="color: red; text-align: center;">데이터를 불러오는 데 실패했습니다. (${error.message})</p>`;
        } finally {
            showLoading(false); // 성공/실패 여부와 관계없이 로딩 숨김
        }
    }

    // --- 이벤트 리스너 ---
    
    // '다음' 버튼 클릭
    nextButton.addEventListener('click', () => {
        currentPage++;
        fetchArticles(currentPage);
    });

    // '이전' 버튼 클릭
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchArticles(currentPage);
        }
    });

    // 페이지가 처음 로드될 때 1페이지 데이터를 불러옴
    fetchArticles(currentPage); 
});