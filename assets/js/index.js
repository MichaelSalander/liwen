const API_URL = "https://script.google.com/macros/s/AKfycbwMy_979smugB7YMwv_N8QgG2vfedud5vWMXZE1nioziDiPX7Dk7A8fOWUTIOQsbSMrzQ/exec";

document.addEventListener("DOMContentLoaded", function() {
    fetch(`${API_URL}?action=getBooks`)
        .then(res => res.json())
        .then(data => {
            const locationContainer = document.getElementById("locationContainer");
            locationContainer.innerHTML = ""; // 清空列表

            data.forEach(book => {
                const bookItem = document.createElement("li");
                bookItem.innerHTML = `
                    <strong>${book.title}</strong> - ${book.author} 
                    <br> ISBN: ${book.isbn} | 目前位置: ${book.location} 
                    <br> 贈書者: ${book.donor} | <a href="${book.libraryLink}" target="_blank">圖書館連結</a>
                    <hr>
                `;
                locationContainer.appendChild(bookItem);
            });
        })
        .catch(err => console.error('無法載入書籍清單:', err));
});
