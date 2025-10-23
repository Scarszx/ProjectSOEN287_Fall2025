document.getElementById("loginForm").onsubmit = function(e){
    e.preventDefault();

    var cookie = document.cookie.split("; ").find(c => c.indexOf("user=") === 0);
    if(!cookie){
        alert("No users registered");
        return;
    }

    // Get cookie value
    var data = cookie.split("=")[1]; // username|password|status
    var parts = data.split("|");
    var storedUsername = parts[0];
    var storedPassword = parts[1];
    var storedStatus = parts[2];

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if(username === storedUsername && password === storedPassword){
        alert("Login successful! Status: " + storedStatus);

        if(storedStatus === "student") window.location.href = "student_dashboard.html";
        else if(storedStatus === "faculty") window.location.href = "faculty_dashboard.html";
        else if(storedStatus === "manager") window.location.href = "manager_dashboard.html";
    } else {
        alert("Invalid credentials");
    }
};