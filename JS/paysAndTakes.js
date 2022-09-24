const tabs = Array.from(document.querySelectorAll(".tab"));

tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
        tab.classList.toggle("active");
    });
});
