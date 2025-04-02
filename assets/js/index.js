document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("libraryContainer");

    // 解析 URL 取得書籍 ID
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get("id");

    // 取得書籍清單
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

                const libraryHeader = document.createElement("div");
                libraryHeader.classList.add("library-header");
                libraryHeader.innerHTML = `<strong>${libraryName}</strong>（共 ${libraries[libraryName].length} 本書） 📂`;
                libraryHeader.addEventListener("click", function () {
                    const bookList = this.nextElementSibling;
                    bookList.style.display = (bookList.style.display === "none") ? "block" : "none";
                });

                const bookList = document.createElement("ul");
                bookList.classList.add("book-list");
                bookList.style.display = "none";

                libraries[libraryName].forEach(book => {
                    const bookItem = document.createElement("li");
                    bookItem.setAttribute("data-id", book.id);

                    // **檢查是否為借閱中**
                    let actionButton;
                    if (book.location === "借閱中") {
                        actionButton = `<button class="borrow-btn" data-id="${book.id}" onclick="returnBook('${book.isbn}', '${book.title}', '${libraryName}')">🔄 還書</button>`;
                    } else if (book.location === "下落不明") {
                        actionButton = `<span style="color: red;">⚠️ 無法操作（下落不明）</span>`;
                    }else {
                        actionButton = `<button class="borrow-btn" data-id="${book.id}" onclick="borrowBook('${book.isbn}', '${book.title}', '${libraryName}')">📖 借書</button>`;
                    }

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

            // **如果 URL 內有書籍 ID，則自動點擊借書按鈕**
            if (bookId) {
                console.log("🔍 取得的書籍 ID:", bookId);
                setTimeout(() => {
                    const borrowButton = document.querySelector(`.borrow-btn[data-id="${bookId}"]`);
                    if (borrowButton) {
                        console.log("🎯 找到借書按鈕，準備自動點擊！");
                        borrowButton.click();
                    } else {
                        console.warn("⚠️ 未找到借書按鈕，請確認 HTML 結構");
                    }
                }, 1000);
            }
        })
        .catch(err => {
            console.error("❌ API 載入錯誤:", err);
            container.innerHTML = `<p>❌ API 載入失敗，請檢查 API</p>`;
        });
});

// 🔹 借書功能
function borrowBook(isbn, title, location) {
    const studentName = prompt("請輸入您的暱稱來借書(作為還書時輸入使用，避免被別人亂還書)：");
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
            alert(data.message); // 📌 讓使用者確認成功
            window.location.href = `success.html?action=borrow&name=${encodeURIComponent(studentName)}&title=${encodeURIComponent(title)}&isbn=${isbn}`;
        } else {
            alert(`❌ 借書失敗: ${data.message}`);
        }
    })
    .catch(err => {
        console.error("❌ 借書錯誤:", err);
        alert("❌ 借書失敗，請稍後再試");
    });
}




// 🔹 更新 UI 書籍狀態
function updateBookStatusUI(isbn, newLocation) {
    console.log(`🔄 更新 UI: ISBN=${isbn}，新地點=${newLocation}`);

    const bookItem = document.querySelector(`[data-isbn="${isbn}"]`);
    if (!bookItem) {
        console.warn(`⚠️ 找不到 ISBN 為 ${isbn} 的書籍項目`);
        return;
    }

    const locationElement = bookItem.querySelector(".book-location");
    if (locationElement) {
        locationElement.textContent = `📍 地點：${newLocation}`;
    }

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
