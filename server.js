// creating some variables and setting up the server
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// getting the css and js files from their respective folders
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js',  express.static(path.join(__dirname, 'js')));

// getting the html files from the pages folder
app.use('/pages', express.static(path.join(__dirname, 'index.html')));

// make the login the first page to load
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html', 'login_page.html'));
});

// other URLs 
app.get('/create-account', (req, res) => res.redirect('/pages/create_account.html'));
app.get('/users',          (req, res) => res.redirect('/pages/page1.html'));
app.get('/manage-users',   (req, res) => res.redirect('/pages/page2.html'));

// 404 error
app.use((req, res) => {
    res.status(404).send('<h1>404</h1><p><a href="/">Back to Login</a></p>');
});

app.listen(PORT, () => {
    console.log(`Server running → http://localhost:${PORT}`);
});