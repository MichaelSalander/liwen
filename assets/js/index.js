fetch('assets/data/books.json')
    .then(res => res.json())
    .then(data => {
        const locationContainer = document.getElementById("locationContainer");

        data.locations.forEach(location => {
            // 建立地點區塊
            const locationDiv = document.createElement("div");
            locationDiv.classList.add("location");

            // 地點標題與借書/還書按鈕
            const locationTitle = document.createElement("h2");
            locationTitle.textContent = location.name;

            const borrowLink = document.createElement("a");
            borrowLink.href = `borrow.html?locationId=${location.id}`;
            borrowLink.textContent = "進入借書/還書";
            borrowLink.style.display = "block";
            borrowLink.style.marginTop = "10px";

            locationDiv.appendChild(locationTitle);
            locationDiv.appendChild(borrowLink);

            // 建立書籍清單
            if (location.books.length > 0) {
                const bookList = document.createElement("ul");
                location.books.forEach(book => {
                    const bookItem = document.createElement("li");
                    bookItem.textContent = `書名：${book.title} (ISBN: ${book.isbn}) - 狀態：${book.status}`;
                    bookList.appendChild(bookItem);
                });
                locationDiv.appendChild(bookList);
            } else {
                const noBooks = document.createElement("p");
                noBooks.textContent = "目前無可借閱書籍。";
                locationDiv.appendChild(noBooks);
            }

            locationContainer.appendChild(locationDiv);
        });
    })
    .catch(err => console.error('無法載入資料:', err));
