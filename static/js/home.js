const nameInp = document.querySelector("#name");
const suggestion = document.querySelector(".suggestion");
const form = document.querySelector(".person");

// Suggestions

nameInp.addEventListener("input", (e) => {
    let value = nameInp.value;
    if (nameInp.value === "") {
        suggestion.innerHTML = "";
        return;
    } else if (nameInp.value.match(/[-[\]{}()*+?.,\\^$|#\s]/g)) {
        suggestion.innerHTML = "";
        return;
    }

    let pos = NaN;

    for (let i = 0; i < names.length; i++) {
        let regex = RegExp("^" + value, "i");

        if (regex.exec(names[i])) {
            pos = i;
            break;
        }
    }

    if (pos || pos == 0) {
        suggestion.innerHTML = `${value}${names[pos].substring(value.length)}`;
    } else {
        suggestion.innerHTML = "";
    }
});

// Submit

form.addEventListener("submit", (e) => {
    e.preventDefault();
    location.href = `/person?name=${suggestion.innerHTML.toLowerCase()}`;
});
