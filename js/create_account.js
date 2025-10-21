document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        status: document.querySelector('input[name="status"]:checked')?.value,
        idNumber: document.getElementById('idNumber').value,
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
    
    if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    console.log('Registration data:', formData);
    
    // Redirect to login
    window.location.href = '../index.html/login_page.html';
});