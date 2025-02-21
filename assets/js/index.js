
document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("libraryContainer");

    fetch(`${API_URL}?action=getBooks`)
        .then(response => response.json())
        .then(data => {
            console.log("📚 書籍數據:", data);
            container.innerHTML = "";

            if (!data || data.length === 0) {
                container.innerHTML = "<p>❌ 沒有書籍資料</p>";
                return;
            }

            // 🔹 按館別分類書籍
            const libraries = {};
            data.forEach(book => {
                if (!libraries[book.location]) {
                    libraries[book.location] = [];
                }
                libraries[book.location].push(book);
            });

            // 🔹 建立多級選單
            Object.keys(libraries).forEach(libraryName => {
                const librarySection = document.createElement("div");
                librarySection.classList.add("library-section");

                // 🔹 館別標題（點擊展開/收起）
                const libraryHeader = document.createElement("div");
                libraryHeader.classList.add("library-header");
                libraryHeader.innerHTML = `<strong>${libraryName}</strong>（共 ${libraries[libraryName].length} 本書） 📂`;
                libraryHeader.addEventListener("click", function () {
                    const bookList = this.nextElementSibling;
                    bookList.style.display = (bookList.style.display === "none") ? "block" : "none";
                });

                // 🔹 書籍清單（預設隱藏）
                const bookList = document.createElement("ul");
                bookList.classList.add("book-list");
                bookList.style.display = "none";

                libraries[libraryName].forEach(book => {
                    const bookItem = document.createElement("li");

                    // **檢查是否為借閱中**
                    let actionButton;
                    if (book.location === "借閱中") {
                        actionButton = `<button onclick="returnBook('${book.isbn}', '${book.title}', '${libraryName}')">🔄 還書</button>`;
                    } else {
                        actionButton = `<button onclick="borrowBook('${book.isbn}', '${book.title}', '${libraryName}')">📖 借書</button>`;
                    }

                    // 🔹 檢查是否有圖書館連結
                    let libraryLinkHTML = "";
                    if (book.libraryLink && book.libraryLink.trim() !== "") {
                        libraryLinkHTML = `<br> <a href="${book.libraryLink}" target="_blank">📖 圖書館連結</a>`;
                    }

                    bookItem.innerHTML = `
                        <strong>${book.title}</strong> - ${book.author}
                        <br> ISBN: ${book.isbn} | 贈書者: ${book.donor}
                        ${libraryLinkHTML}
                        <br> ${actionButton}
                    `;
                    bookList.appendChild(bookItem);
                });

                librarySection.appendChild(libraryHeader);
                librarySection.appendChild(bookList);
                container.appendChild(librarySection);
            });
        })
        .catch(err => {
            console.error("❌ API 載入錯誤:", err);
            container.innerHTML = `<p>❌ API 載入失敗，請檢查 API</p>`;
        });
});


// 🔹 借書功能
function borrowBook(isbn, title, location) {
    const studentName = prompt("請輸入您的姓名來借書：");
    if (!studentName) {
        alert("借書取消");
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
        if (data.success) {
            alert(data.message);
            // **📌 即時更新 UI**
            updateBookStatusUI(isbn, "借閱中");
        } else {
            alert(`❌ 借書失敗: ${data.message}`);
        }
    })
    .catch(err => {
        console.error("❌ 借書錯誤:", err);
        alert("❌ 借書失敗，請稍後再試");
    });
}

libraries[libraryName].forEach(book => {
    const bookItem = document.createElement("li");

    // 借書按鈕
    const borrowButton = `<button onclick="borrowBook('${book.isbn}', '${book.title}', '${libraryName}')">📖 借書</button>`;

    bookItem.innerHTML = `
        <strong>${book.title}</strong> - ${book.author}
        <br> ISBN: ${book.isbn} | 贈書者: ${book.donor}
        <br> ${borrowButton}
    `;
    bookList.appendChild(bookItem);
});

function updateBookStatusUI(isbn, newLocation) {
    console.log(`🔄 更新 UI: ISBN=${isbn}，新地點=${newLocation}`);

    const bookItem = document.querySelector(`[data-isbn="${isbn}"]`);
    if (!bookItem) {
        console.warn(`⚠️ 找不到 ISBN 為 ${isbn} 的書籍項目`);
        return;
    }

    // **📌 更新顯示的地點**
    const locationElement = bookItem.querySelector(".book-location");
    if (locationElement) {
        locationElement.textContent = `📍 地點：${newLocation}`;
    }

    // **📌 替換按鈕**
    const actionButton = bookItem.querySelector("button");
    if (newLocation === "借閱中") {
        actionButton.textContent = "🔄 還書";
        actionButton.setAttribute("onclick", `returnBook('${isbn}', '${bookItem.dataset.title}', '${newLocation}')`);
    } else {
        actionButton.textContent = "📖 借書";
        actionButton.setAttribute("onclick", `borrowBook('${isbn}', '${bookItem.dataset.title}', '${newLocation}')`);
    }

    console.log(`✅ 書籍 ${isbn} 已更新至 ${newLocation}`);
}
