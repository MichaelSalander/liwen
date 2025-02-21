// 確保 `API_URL` 來自 `config.js`
if (typeof API_URL === "undefined") {
    console.error("❌ API_URL 未定義，請確認 config.js 是否正確載入");
}

// 📌 更新書籍狀態（借書或還書）
function updateBookStatus(isbn, title, author, status, location, donor, fileName, fileSource, libraryLink) {
    if (!isbn) {
        alert("❌ 請輸入 ISBN！");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isbn, title, author, status, location, donor, fileName, fileSource, libraryLink })
    })
    .then(res => res.json())
    .then(data => {
        console.log("📖 API 回應:", data);
        alert(data.message);
        getHistory(); // 更新最近紀錄
    })
    .catch(err => console.error("❌ 無法更新書籍:", err));
}

// 📌 借書函式
function borrowBook(isbn, title, location) {
    if (!isbn) {
        alert("❌ ISBN 不能為空！");
        return;
    }

    const studentName = prompt("請輸入您的姓名來借書：");
    if (!studentName) {
        alert("❌ 借書取消");
        return;
    }

    console.log(`📖 準備借書: ISBN=${isbn}, 書名=${title}, 借書地點=${location}`);

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            action: "borrowBook",
            isbn: isbn,
            title: title,
            location: location,
            studentName: studentName
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("📖 借書 API 回應:", data);
        alert(data.message);
        location.reload();
    })
    .catch(err => {
        console.error("❌ 借書錯誤:", err);
        alert("❌ 借書失敗，請稍後再試");
    });
}

// 📌 還書函式
function returnBook(isbn, title, borrowedLocation) {
    if (!isbn) {
        alert("❌ ISBN 不能為空！");
        return;
    }

    const returnLocation = promptForReturnLocation();
    if (!returnLocation) {
        alert("❌ 取消還書");
        return;
    }

    console.log(`📚 準備還書: ISBN=${isbn}, 書名=${title}, 借出地點=${borrowedLocation}, 還書地點=${returnLocation}`);

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            action: "returnBook",
            isbn: isbn,
            title: title,
            borrowedLocation: borrowedLocation,
            returnLocation: returnLocation
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("📚 還書 API 回應:", data);
        alert(data.message);
        location.reload();
    })
    .catch(err => {
        console.error("❌ 還書錯誤:", err);
        alert("❌ 還書失敗，請稍後再試");
    });
}

// 📌 讀取最近 5 次借還紀錄
function getHistory() {
    fetch(`${API_URL}?action=getHistory`)
        .then(res => res.json())
        .then(data => {
            console.log("📖 借閱紀錄:", data);
            const historyList = document.getElementById("historyList");
            if (!historyList) {
                console.error("❌ 找不到 historyList 元素！");
                return;
            }
            historyList.innerHTML = "";

            data.forEach(record => {
                const li = document.createElement("li");
                li.textContent = `[${record.timestamp}] ${record.action} - 書名：${record.title} - 地點：${record.location}`;
                historyList.appendChild(li);
            });
        })
        .catch(err => console.error("❌ 無法載入歷史紀錄:", err));
}

// 📌 初始化（綁定按鈕事件）
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ borrow.js 已載入！");

    const borrowButton = document.getElementById("borrowButton");
    if (borrowButton) {
        borrowButton.addEventListener("click", function () {
            const isbn = document.getElementById("isbn") ? document.getElementById("isbn").value.trim() : "";
            if (!isbn) {
                alert("❌ 請輸入 ISBN！");
                return;
            }
            borrowBook(isbn, "未知書籍", "麗文書局");
        });
    } else {
        console.warn("⚠️ 找不到 `borrowButton`，請檢查 HTML 結構");
    }

    const returnButton = document.getElementById("returnButton");
    if (returnButton) {
        returnButton.addEventListener("click", function () {
            const isbn = document.getElementById("isbn") ? document.getElementById("isbn").value.trim() : "";
            if (!isbn) {
                alert("❌ 請輸入 ISBN！");
                return;
            }
            returnBook(isbn, "未知書籍", "借閱中");
        });
    } else {
        console.warn("⚠️ 找不到 `returnButton`，請檢查 HTML 結構");
    }
});

// 📌 還書時選擇地點（下拉選單）
function promptForReturnLocation() {
    const locations = ["麗文書局", "達賢圖", "其他"];
    let options = locations.map((loc, index) => `${index + 1}. ${loc}`).join("\n");

    let choice = prompt(`請選擇還書地點:\n${options}`);
    if (!choice) return null;

    let index = parseInt(choice, 10);
    return locations[index - 1] || null;
}
