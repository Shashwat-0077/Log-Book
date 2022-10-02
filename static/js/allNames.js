let rows = Array.from(document.querySelectorAll(".row"));

rows.forEach((row) => {
    row.addEventListener("click", (e) => {
        location.href = `/person?name=${row
            .querySelector("p")
            .innerHTML.toLowerCase()}`;
    });
});
