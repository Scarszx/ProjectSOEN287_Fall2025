 let eyeicon = document.getElementById("eyeicon");
 let password = document.getElementById("password");

 //changing input type to show or hide password
eyeicon.onclick = function(){
    if(password.type == "password"){
        password.type = "text";
        eyeicon.src = "../css/icons/eye-open.png";
    }else{
        password.type = "password";
        eyeicon.src ="../css/icons/eye-close.png";
    }
}