const tabs = Array.from(document.querySelectorAll(".tab"));

tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
        if (tab.classList.contains("active")) {
            tab.classList.remove("active");
            return;
        }

        tabs.forEach((innerTab) => {
            innerTab.classList.remove("active");
        });

        tab.classList.toggle("active");
    });
});

const entries = document.querySelectorAll(".content tr");

entries.forEach((entry) => {
    entry.addEventListener("click", (e) => {
        if (entry.querySelector(".action").classList.contains("active")) {
            entry.querySelector(".action").classList.remove("active");
            e.stopPropagation();
            return;
        }

        entries.forEach((entry) => {
            entry.querySelector(".action").classList.remove("active");
        });

        entry.querySelector(".action").classList.add("active");
        e.stopPropagation();
    });
});
