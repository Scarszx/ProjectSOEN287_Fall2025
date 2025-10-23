document.getElementById("registerForm").onsubmit = function(e){
    e.preventDefault();

    var username = document.getElementById("new_username").value;
    var status = document.getElementById("status").value;
    var password = document.getElementById("new_password").value;

    // Store as plain string in cookie: username|password|status
    document.cookie = "user=" + username + "|" + password + "|" + status + ";path=/";

    alert("Account created!");
    window.location.href = "login_page.html";
};