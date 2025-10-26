//page 1 script








//Script to load header dynamically -->

fetch("header.html")
    .then(res => res.text())
    .then(html => {
    document.getElementById("header-container").innerHTML = html;
    })
    .then(() => {
    // Optional: dynamically set user info (simulate logged-in user)
    const user = { name: "John Doe", role: "Student" };
    document.getElementById("username").textContent = user.name;
    document.getElementById("userRole").textContent = user.role;
    })
    .catch(err => console.error("Error loading header:", err));