//required modules
const http=require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');//Usage not defined yet 

//Definition of the host name and port for the server
const hostname = 'localhost';
const port = 3000;

//Creating the server
const server = http.createServer((req, res) => {
    //Extracting url path from the request
    let filePath ='';
    
    //Determine which file to serve based on the request URL
    switch(req.url) {
        case '/login':
            filePath = 'login_page.html';
            break;
        case '/create-account':
            filePath = 'create_account.html';
            break;
        case '/users':
            filePath = 'page1.html';
            break;
        case '/manage-users':
            filePath = 'page2.html';
            break;
        default:
            filePath = path.join(__dirname, 'public', '404.html');
    }   
    //Construct the full file path
    const fullPath = path.join(__dirname, filePath);

    //Read the file asynchronously
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            //If error occurs (e.g., file not found), send 500 response
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('500 - Internal Server Error: Unable to read the requested file.');
        }
        else {
            //If file is read successfully, send 200 response with file content
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(data);
        }
    });

});
//Start the server and listen on the defined port and hostname
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});