
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

// Rolling Placeholder for Username Field
const usernameInput = document.getElementById('username');
const phrases = ["Enter your username", "Use your email address", "No spaces allowed", "Example: johndoe"];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function animatePlaceholder() {
    const text = phrases[phraseIndex % phrases.length];
    usernameInput.placeholder = isDeleting 
        ? text.substring(0, charIndex)
        : text.substring(0, charIndex + 1);

    if (!isDeleting) {
        charIndex++;
        if (charIndex === text.length) {
            isDeleting = true;
            setTimeout(animatePlaceholder, 1000);
            return;
        }
    } else {
        charIndex--;
        if (charIndex < 0) {
            isDeleting = false;
            phraseIndex++;
        }
    }

    setTimeout(animatePlaceholder, isDeleting ? 60 : 100);
}

// Start the animation after a short delay
setTimeout(animatePlaceholder, 700);
