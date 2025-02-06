let books = [];
let storeName = "未知地點";

// 取得 URL 參數（地點 ID）
const urlParams = new URLSearchParams(window.location.search);
const locationId = urlParams.get("locationId");

fetch('assets/data/books.json')
    .then(res => res.json())
    .then(data => {
        const location = data.locations.find(loc => loc.id === locationId);
        if (location) {
            storeName = location.name;
            books = location.books;
            document.getElementById("storeName").textContent = `${storeName} - 借書/還書`;
            updateHistoryList();
        }
    })
    .catch(err => console.error('無法載入資料:', err));

// 更新最近 5 次借還紀錄
function updateHistoryList() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";
    const recentHistory = books
        .flatMap(book => book.history)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

    recentHistory.forEach(record => {
        const li = document.createElement("li");
        li.textContent = `[${record.timestamp}] ${record.action} - 書名：${record.title} - 地點：${record.location}`;
        historyList.appendChild(li);
    });
}
