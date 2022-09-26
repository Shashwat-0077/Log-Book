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
