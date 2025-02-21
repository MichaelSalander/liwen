console.log("✅ return.js 已載入！");

// 📌 創建自訂彈出式視窗
function createReturnLocationDialog(callback) {
    // 移除舊的彈窗（防止重複）
    const oldDialog = document.getElementById("returnDialog");
    if (oldDialog) oldDialog.remove();

    // 建立對話框
    const dialog = document.createElement("dialog");
    dialog.id = "returnDialog";
    dialog.innerHTML = `
        <form method="dialog">
            <h3>請選擇還書地點</h3>
            <label for="returnLocation">還書地點：</label>
            <select id="returnLocation">
                <option value="麗文書局">麗文書局</option>
                <option value="達賢圖">達賢圖</option>
                <option value="其他">其他</option>
            </select>
            <input type="text" id="customLocation" placeholder="請輸入還書地點" style="display: none;">
            <br><br>
            <button type="submit">確認</button>
            <button type="button" id="cancelBtn">取消</button>
        </form>
    `;
    
    document.body.appendChild(dialog);
    
    const returnLocationSelect = dialog.querySelector("#returnLocation");
    const customLocationInput = dialog.querySelector("#customLocation");
    const cancelBtn = dialog.querySelector("#cancelBtn");

    // 📌 監聽下拉選單變化，若選擇「其他」，顯示輸入框
    returnLocationSelect.addEventListener("change", function () {
        if (this.value === "其他") {
            customLocationInput.style.display = "block";
        } else {
            customLocationInput.style.display = "none";
            customLocationInput.value = "";
        }
    });

    // 📌 處理取消按鈕
    cancelBtn.addEventListener("click", function () {
        dialog.close(); // 關閉彈窗
        callback(null); // 回傳 null 表示取消
    });

    // 📌 處理確認按鈕
    dialog.addEventListener("close", function () {
        let returnLocation = returnLocationSelect.value;
        if (returnLocation === "其他") {
            returnLocation = customLocationInput.value.trim();
            if (!returnLocation) {
                alert("❌ 請輸入還書地點！");
                return;
            }
        }
        callback(returnLocation);
    });

    // 📌 顯示彈窗
    dialog.showModal();
}

// 📌 還書函式
function returnBook(isbn, title, borrowedLocation) {
    console.log(`📚 準備還書: ISBN=${isbn}, 書名=${title}, 借出地點=${borrowedLocation}`);

    if (!isbn) {
        alert("❌ ISBN 不能為空！");
        return;
    }

    // 彈出還書地點選擇視窗
    createReturnLocationDialog(function(returnLocation) {
        if (!returnLocation) {
            alert("❌ 取消還書");
            return;
        }

        console.log(`📚 送出還書請求: ISBN=${isbn}, 書名=${title}, 借出地點=${borrowedLocation}, 還書地點=${returnLocation}`);

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
            if (data.success) {
                alert(data.message);
                updateBookStatusUI(isbn, returnLocation);
            } else {
                alert(`❌ 還書失敗: ${data.message}`);
            }
        })
        .catch(err => {
            console.error("❌ 還書錯誤:", err);
            alert("❌ 還書失敗，請稍後再試");
        });
    });
}

// 📌 綁定 `還書` 按鈕
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ 綁定還書按鈕事件");

    document.querySelectorAll(".return-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const isbn = this.getAttribute("data-isbn") || "";
            const title = this.getAttribute("data-title") || "";
            const location = this.getAttribute("data-location") || "";

            if (!isbn) {
                console.error("❌ `data-isbn` 屬性不存在！");
                alert("找不到 ISBN，請重新整理頁面！");
                return;
            }

            returnBook(isbn, title, location);
        });
    });
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
