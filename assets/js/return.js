document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("libraryContainer");
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get("id");

    fetch(`${API_URL}?action=getBooks`)
        .then(response => response.json())
        .then(data => {
            console.log("📚 書籍數據:", data);
            container.innerHTML = "";

            if (!data || data.length === 0) {
                container.innerHTML = "<p>❌ 沒有書籍資料</p>";
                return;
            }

            const libraries = {};
            data.forEach(book => {
                if (!libraries[book.location]) libraries[book.location] = [];
                libraries[book.location].push(book);
            });

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
                    bookItem.setAttribute("data-isbn", book.isbn);
                    bookItem.setAttribute("data-title", book.title);

                    let actionButton = "";
                    if (book.location === "借閱中") {
                        actionButton = `<button class="borrow-btn" data-id="${book.id}" onclick="returnBook('${book.isbn}', '${book.title}', '${libraryName}')">🔄 還書</button>`;
                    } else if (book.location === "下落不明") {
                        actionButton = `<span style="color: red;">⚠️ 無法操作（下落不明）</span>`;
                    }else {
                        actionButton = `<button class="borrow-btn" data-id="${book.id}" onclick="borrowBook('${book.isbn}', '${book.title}', '${libraryName}')">📖 借書</button>`;
                    }

                    const libraryLinkHTML = (book.libraryLink && book.libraryLink.trim() !== "") ?
                        `<br> <a href="${book.libraryLink}" target="_blank">📖 圖書館連結</a>` : "";

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

// ✅ 借書功能
function borrowBook(isbn, title, location) {
    const studentName = prompt("請輸入您的暱稱來借書：");
    if (!studentName) {
        alert("借書取消");
        return;
    }

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
            if (data.success) {
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

// ✅ 還書功能（含動態館別選單）
// ✅ 還書主函式（含跳轉 success.html）
function returnBook(isbn, title, borrowedLocation) {
    if (!isbn) {
        alert("❌ ISBN 不能為空！");
        return;
    }

    // 從書籍資料中取得所有有效館別
    fetch(`${API_URL}?action=getBooks`)
        .then(res => res.json())
        .then(books => {
            const uniqueLocations = [...new Set(
                books.map(book => book.location)
                     .filter(loc => loc && loc !== "借閱中" && loc !== "下落不明")
            )];

            createReturnLocationDialog(uniqueLocations, function(returnLocation) {
                if (!returnLocation) {
                    alert("❌ 還書已取消");
                    return;
                }

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
                    if (data.success) {
                        updateBookStatusUI(isbn, returnLocation);
                        window.location.href = `success.html?action=return&title=${encodeURIComponent(title)}&isbn=${isbn}&returnLocation=${encodeURIComponent(returnLocation)}`;
                    } else {
                        alert(`❌ 還書失敗: ${data.message}`);
                    }
                })
                .catch(err => {
                    console.error("❌ 還書錯誤:", err);
                    alert("❌ 還書失敗，請稍後再試");
                });
            });
        });
}


// ✅ 還書選單（未選不會觸發還書）
function createReturnLocationDialog(locations, callback) {
    const oldDialog = document.getElementById("returnDialog");
    if (oldDialog) oldDialog.remove();

    const dialog = document.createElement("dialog");
    dialog.id = "returnDialog";

    const optionsHTML = ['<option value="" disabled selected>-- 請選擇還書地點 --</option>']
        .concat(locations.map(loc => `<option value="${loc}">${loc}</option>`))
        .join("");

    dialog.innerHTML = `
        <form id="returnForm">
            <h3>請選擇還書地點</h3>
            <select id="returnLocation" required>${optionsHTML}</select>
            <br><br>
            <button type="submit">確認</button>
            <button type="button" id="cancelBtn">取消</button>
        </form>
    `;
    document.body.appendChild(dialog);

    const returnLocationSelect = dialog.querySelector("#returnLocation");
    const cancelBtn = dialog.querySelector("#cancelBtn");
    const form = dialog.querySelector("#returnForm");

    // ✅ 點確認才觸發 callback（不讓 close 自動送出）
    form.addEventListener("submit", function (e) {
        e.preventDefault(); // 避免 dialog 自動關閉

        const selected = returnLocationSelect.value;
        if (!selected) {
            alert("❌ 請選擇還書地點！");
            return;
        }

        dialog.close();
        callback(selected); // ✅ 使用者確實有選擇地點
    });

    cancelBtn.addEventListener("click", () => {
        dialog.close();
        callback(null); // ✅ 使用者點取消
    });

    dialog.showModal();
}




// ✅ 更新畫面上的書籍狀態
function updateBookStatusUI(isbn, newLocation) {
    const bookItem = document.querySelector(`[data-isbn="${isbn}"]`);
    if (!bookItem) return;

    const actionButton = bookItem.querySelector("button");
    if (newLocation === "借閱中") {
        actionButton.textContent = "🔄 還書";
        actionButton.setAttribute("onclick", `returnBook('${isbn}', '${bookItem.dataset.title}', '${newLocation}')`);
    } else {
        actionButton.textContent = "📖 借書";
        actionButton.setAttribute("onclick", `borrowBook('${isbn}', '${bookItem.dataset.title}', '${newLocation}')`);
    }
}
