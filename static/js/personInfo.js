const editBtn = Array.from(document.querySelectorAll(".editBtn"));
const delBtn = Array.from(document.querySelectorAll(".deleteBtn"));
const cancelBtn = document.querySelector(".cancel");
const editForm = document.querySelector(".edit-form");
const form = editForm.querySelector("form");
const personName = document.querySelector("legend");
const [itemName, price] = Array.from(editForm.querySelectorAll("input"));

function exitEditScreen() {
    editForm.classList.remove("active");
    form.setAttribute("action", "");
    itemName.value = "";
    price.value = 0;
}

cancelBtn.addEventListener("click", (event) => {
    exitEditScreen();
    event.stopPropagation();
    event.preventDefault();
});

editForm.addEventListener("click", (event) => {
    exitEditScreen();
    event.stopPropagation();
});

form.addEventListener("click", (event) => {
    event.stopPropagation();
});

editBtn.forEach((button) => {
    button.addEventListener("click", (event) => {
        editForm.classList.add("active");
        let item = button.closest("tr");
        let parent = item.closest(".content");

        itemName.value = item.querySelector(".name").innerHTML;
        price.value = item.querySelector(".price").innerHTML;

        form.setAttribute(
            "action",
            `/person/${parent.dataset.path}/edit/${parent.dataset.id}/${item.id}`
        );

        event.stopPropagation();
    });
});

delBtn.forEach((button) => {
    button.addEventListener("click", (event) => {
        let parentRow = button.closest("tr");
        location.href = `/delete/${parentRow.id}`;
        event.stopPropagation();
    });
});
