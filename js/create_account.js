document.getElementById("registerForm").onsubmit = function(e){
    e.preventDefault();

    var username = document.getElementById("new_username").value;
    var statusElement = document.querySelector('input[name="status"]:checked');
    var status = statusElement ? statusElement.value : '';

    var password = document.getElementById("new_password").value;
    var confirmPassword = document.getElementById("confirm_password").value;
    if(password !== confirmPassword){
        alert("Passwords do not match!");
        return;
    }


    // Store as plain string in cookie: username|password|status
    document.cookie = "user=" + username + "|" + password + "|" + status + ";path=/";

    alert("Account created!");
    window.location.href = "../index.html/login_page.html";
};