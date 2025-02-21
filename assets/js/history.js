console.log("✅ history.js 已載入！");

// 📌 獲取最近 100 次借閱紀錄
function getHistory() {
    console.log("📖 嘗試獲取最近借閱紀錄...");

    fetch(`${API_URL}?action=getHistory`)
        .then(res => res.json())
        .then(data => {
            console.log("📖 借閱紀錄 API 回應:", data);
            
            const historyList = document.getElementById("historyList");
            const messageDiv = document.getElementById("message");

            if (!historyList) {
                console.error("❌ `historyList` 元素不存在，請檢查 HTML 結構");
                return;
            }

            historyList.innerHTML = ""; // **清空列表**
            messageDiv.innerHTML = ""; // **清空錯誤訊息**

            if (!data || data.length === 0) {
                historyList.innerHTML = "<li>❌ 沒有借閱紀錄</li>";
                return;
            }

            data.slice(-100).forEach(record => { // **確保只顯示最近 100 筆**
                const li = document.createElement("li");
                li.textContent = `[${record.timestamp}] ${record.action} - 書名：${record.title} - 地點：${record.location}`;
                historyList.appendChild(li);
            });
        })
        .catch(err => {
            console.error("❌ 無法載入歷史紀錄:", err);
            document.getElementById("message").innerHTML = `<p style="color: red;">❌ 讀取歷史紀錄失敗，請稍後再試</p>`;
        });
}

// 📌 當頁面載入時執行
document.addEventListener("DOMContentLoaded", getHistory);
