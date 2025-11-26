document.getElementById("registerForm").onsubmit = async function(e) {
    e.preventDefault();

    const password = document.getElementById("new_password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    const data = {
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        email: document.getElementById("email").value,
        status: document.querySelector('input[name="status"]:checked').value,
        id_number: document.getElementById("id").value,
        new_username: document.getElementById("new_username").value,
        new_password: document.getElementById("new_password").value
    };
    

    const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message);

    if (result.success) {
        alert("Account created successfully! Please log in.");
        window.location.href = "/login_page.html";
    }
    
};