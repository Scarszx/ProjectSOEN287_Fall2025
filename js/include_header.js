function loadHeader() {
    fetch("../index.html/header.html")
        .then(r => r.text())
        .then(d => {
            document.getElementById("header-placeholder").innerHTML = d;
        })
        .catch(e => console.error("Header load error:", e));
}

document.addEventListener("DOMContentLoaded", loadHeader);
