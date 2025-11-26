//page 1 script

//Script to load header dynamically -->

fetch('/api/me')
    .then(res => res.json())
    .then(data => {
        if (!data.loggedIn) {
            alert("Please login first");
            window.location.href = "/index.html/login_page.html";
        } else {
            document.getElementById("username").textContent = data.user.first_name;
            document.getElementById("userRole").textContent = data.user.status;
        }
    });