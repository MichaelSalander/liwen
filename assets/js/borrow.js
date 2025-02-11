const API_URL = "https://script.google.com/macros/s/AKfycbwMy_979smugB7YMwv_N8QgG2vfedud5vWMXZE1nioziDiPX7Dk7A8fOWUTIOQsbSMrzQ/exec";

// 更新書籍狀態（借書或還書）
function updateBookStatus(isbn, title, author, status, location, donor, fileName, fileSource, libraryLink) {
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ isbn, title, author, status, location, donor, fileName, fileSource, libraryLink }),
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        getHistory(); // 更新最近紀錄
    })
    .catch(err => console.error('無法更新書籍:', err));
}

// 借書按鈕事件
document.getElementById("borrowButton").addEventListener("click", () => {
    const isbn = document.getElementById("isbn").value.trim();
    updateBookStatus(isbn, "未知書籍", "未知作者", "漂流中", "麗文書局", "未知贈書者", "", "", "");
});

// 還書按鈕事件
document.getElementById("returnButton").addEventListener("click", () => {
    const isbn = document.getElementById("isbn").value.trim();
    updateBookStatus(isbn, "未知書籍", "未知作者", "可借閱", "麗文書局", "未知贈書者", "", "", "");
});

// 讀取最近 5 次借還紀錄
function getHistory() {
    fetch(`${API_URL}?action=getHistory`)
        .then(res => res.json())
        .then(data => {
            const historyList = document.getElementById("historyList");
            historyList.innerHTML = ""; // 清空列表

            data.forEach(record => {
                const li = document.createElement("li");
                li.textContent = `[${record.timestamp}] ${record.action} - 書名：${record.title} - 地點：${record.location}`;
                historyList.appendChild(li);
            });
        })
        .catch(err => console.error('無法載入歷史紀錄:', err));
}

// 初始化
document.addEventListener("DOMContentLoaded", getHistory);
