const tabs = Array.from(document.querySelectorAll(".tab"));

tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
        tabs.forEach((innerTab) => {
            innerTab.classList.remove("active");
        });

        tab.classList.toggle("active");
    });
});
