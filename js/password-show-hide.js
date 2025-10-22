
const eyes = document.querySelectorAll(".eyeicon");
const passwords = document.querySelectorAll(".password-field");

eyes.forEach((eye, i) => {
    eye.onclick = () => {
        if (passwords[i].type === "password") {
            passwords[i].type = "text";
            eye.src = "../css/icons/eye-open.png";
        } else {
            passwords[i].type = "password";
            eye.src = "../css/icons/eye-close.png";
        }
    };
});
