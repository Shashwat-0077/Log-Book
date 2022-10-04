const nameInp = document.querySelector("#name");
const suggestion = document.querySelector(".suggestion");
const form = document.querySelector(".person");

// Suggestions

nameInp.addEventListener("input", (e) => {
    let value = nameInp.value;
    if (nameInp.value === "") {
        suggestion.innerHTML = "";
        suggestion.id = "null";
        return;
    } else if (nameInp.value.match(/[-[\]{}()*+?.,\\^$|#\s]/g)) {
        suggestion.innerHTML = "";
        suggestion.id = "null";
        return;
    }

    let pos = NaN;

    for (let i = 0; i < people.length; i++) {
        let regex = RegExp("^" + value, "i");

        if (regex.exec(people[i].name)) {
            pos = i;
            break;
        }
    }

    if (pos || pos == 0) {
        suggestion.innerHTML = `${value}${people[pos].name.substring(
            value.length
        )}`;
        suggestion.id = people[pos].id;
    } else {
        suggestion.innerHTML = "";
        suggestion.id = "null";
    }
});

// Submit

form.addEventListener("submit", (e) => {
    e.preventDefault();
    location.href = `/person/${suggestion.id}`;
});
