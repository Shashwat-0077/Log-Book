let rows = Array.from(document.querySelectorAll(".row"));

rows.forEach((row) => {
    row.addEventListener("click", (e) => {
        location.href = `/person/${row.querySelector("p").id}`;
    });
});
