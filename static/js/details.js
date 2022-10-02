const tabs = Array.from(document.querySelectorAll(".tab"));
const contents = Array.from(document.querySelectorAll(".content"));
const heights = contents.map(
    (cont) => parseFloat(window.getComputedStyle(cont).height) + 30
);

function minimizeContent() {
    contents.forEach((cont) => {
        cont.style.maxHeight = 0;
    });
}
minimizeContent();

for (let i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", (e) => {
        let content = tabs[i].querySelector(".content");
        if (tabs[i].classList.contains("active")) {
            tabs[i].classList.remove("active");
            content.style.maxHeight = 0;
            return;
        }

        tabs.forEach((innerTab) => {
            innerTab.classList.remove("active");
            minimizeContent();
        });

        tabs[i].classList.toggle("active");
        content.style.maxHeight = heights[i] + "px";
    });
}
