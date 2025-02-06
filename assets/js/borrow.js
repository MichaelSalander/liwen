// 假資料模擬
const books = [
    { isbn: "9781234567890", title: "書名A", status: "可借閱", history: [] },
    { isbn: "9780987654321", title: "書名B", status: "漂流中", history: [] },
    { isbn: "9785432109876", title: "書名C", status: "可借閱", history: [] }
];

const historyList = document.getElementById("historyList");
const messageBox = document.getElementById("message");
const isbnInput = document.getElementById("isbn");

// 更新最近 5 次借還紀錄
function updateHistoryList() {
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

// 顯示訊息
function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = type === "success" ? "success" : "error";
}

// 借書功能
document.getElementById("borrowButton").addEventListener("click", () => {
    const isbn = isbnInput.value.trim();
    if (!isbn) {
        showMessage("請輸入或掃描 ISBN！", "error");
        return;
    }

    const book = books.find(b => b.isbn === isbn);
    if (book && book.status === "可借閱") {
        book.status = "漂流中";
        book.history.push({
            timestamp: new Date().toLocaleString(),
            action: "漂書",
            location: "麗文書局",
            title: book.title
        });
        showMessage(`成功借書：${book.title}！`, "success");
        updateHistoryList();
    } else if (book) {
        showMessage(`書籍：${book.title} 已經漂流中！`, "error");
    } else {
        showMessage("找不到此 ISBN 的書籍！", "error");
    }
});

// 還書功能
document.getElementById("returnButton").addEventListener("click", () => {
    const isbn = isbnInput.value.trim();
    if (!isbn) {
        showMessage("請輸入或掃描 ISBN！", "error");
        return;
    }

    const book = books.find(b => b.isbn === isbn);
    if (book && book.status === "漂流中") {
        book.status = "可借閱";
        book.history.push({
            timestamp: new Date().toLocaleString(),
            action: "還書",
            location: "麗文書局",
            title: book.title
        });
        showMessage(`成功還書：${book.title}！`, "success");
        updateHistoryList();
    } else if (book) {
        showMessage(`書籍：${book.title} 並未漂流中！`, "error");
    } else {
        showMessage("找不到此 ISBN 的書籍！", "error");
    }
});

// 模擬掃描二維碼
document.getElementById("scanButton").addEventListener("click", () => {
    const simulatedISBN = "9781234567890"; // 模擬掃描結果
    isbnInput.value = simulatedISBN;
    showMessage(`已掃描 ISBN：${simulatedISBN}`, "success");
});

// 初始化
updateHistoryList();
