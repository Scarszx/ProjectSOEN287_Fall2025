document.getElementById("loginForm").onsubmit = async function(e) {
    e.preventDefault();

    const data = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (result.success) {
            // Success 
            window.location.href = result.redirect;
        } else {
            // show alert on error
            alert(result.message || "Login failed. Please try again.");
        }
    } catch (err) {
        console.error(err);
        alert("Server error. Please try again later.");
    }
};