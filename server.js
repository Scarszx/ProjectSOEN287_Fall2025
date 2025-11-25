// creating some variables and setting up the server
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

//MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  
    database: 'campus_booking'
});

db.connect(err => {
    if (err) {
        console.error('MySQL connection failed:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Middleware setup
app.use(express.json());
app.use(session({
    secret: 'soen287-secret-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, 'index.html')));  
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Routes
app.post('/api/register', (req, res) => {
    const { first_name, last_name, email, status, id_number, new_username, new_password } = req.body;
    const hashed = crypto.createHash('sha256').update(new_password).digest('hex');

    const sql = `INSERT INTO users (first_name, last_name, email, status, id_number, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [first_name, last_name, email, status, id_number, new_username, hashed], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.json({ success: false, message: 'Username/Email/ID already taken' });
            return res.json({ success: false, message: 'Error' });
        }
        res.json({ success: true, message: 'Account created!' });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const hashed = crypto.createHash('sha256').update(password).digest('hex');

    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, hashed], (err, results) => {
        if (err || results.length === 0) {
            return res.json({ success: false, message: 'Wrong username or password' });
        }
        const user = results[0];
        req.session.user = user;

        let redirect = '/student_dashboard.html';
        if (user.status === 'faculty') redirect = '/faculty_dashboard.html';
        if (user.status === 'resource_manager') redirect = '/manager_dashboard.html';

        res.json({ success: true, redirect });
    });
});

app.get('/api/me', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});


//create resource
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/page2', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html', 'page2.html'));
});
app.post('/submit/create_resource', (req, res) => {
  const resource_name = req.body.resource_name;
  const resource_type = req.body.resource_type;
  const resource_id = req.body.resource_id;
  const resource_description = req.body.resource_description;
  const checksql=`SELECT COUNT(*) AS count FROM resource Where resource_id=?`;
  db.query(checksql, [resource_id], (err, results) => {
  if (err) {
    return res.status(500).send('Error checking resource id');
  }
  if (results[0].count > 0) {
    return res.send(`<script>
      alert('Resource ID already exists. Please choose a different ID.');
      window.location.href = '/create_resource.html';
    </script>`);
  } else {
    const sql = 'INSERT INTO resource (resource_name, resource_type, resource_id, resource_description) VALUES (?, ?, ?, ?)';
    db.query(sql,[resource_name, resource_type, resource_id, resource_description], (err, result) => {
    if (err) {
      res.status(500).send('Error inserting data');
    } else {
      res.send(`added sucesfully:<br>
        resource name:${resource_name}<br>
        resource type:${resource_type}<br>
        resource id:${resource_id}<br>
        resource description:${resource_description}<br>
        Redirecting in 2 seconds...
        <script>
            setTimeout(() => {
                window.location.href = '/page2';
            }, 2000);
        </script>`);
    }
    });
  }
  });
});

//room booking
app.post('/submit/room_booking', (req, res) => {
    const resource_id = req.body.resource_id;
    const date = req.body.date;
    const start_time = Number(req.body.start_time);
    const end_time = Number(req.body.end_time);
    const purpose = req.body.purpose;

    if (end_time <= start_time) {
        return res.send(`<script>
            alert('End time must be later than start time.');
            window.location.href = '/room_booking.html';
        </script>`);
    }

    const checksql = `SELECT COUNT(*) AS count FROM resource WHERE resource_id=?`;

    //Check if resource exists
    db.query(checksql, [resource_id], (err, results) => {
        if (err) {
            return res.status(500).send('Error checking resource id');
        }
        if (results[0].count == 0) {
            return res.send(`<script>
                alert('Resource ID does not exist. Please choose a different ID.');
                window.location.href = '/room_booking.html';
            </script>`);
        }

        //Check resource type NOW inside callback
        const checktypesql = `SELECT resource_type FROM resource WHERE resource_id=?`;

        db.query(checktypesql, [resource_id], (err, rows) => {
            if (err) {
                return res.status(500).send('Error checking resource type');
            }

            if (rows[0].resource_type !== "room") {
                return res.send(`<script>
                    alert('Resource ID is not a room. Please choose a different ID.');
                    window.location.href = '/room_booking.html';
                </script>`);
            }

            //Insert booking ONLY after type check succeeds
            const sql = `INSERT INTO room_booking 
                        (resource_id, date, start_time, end_time, purpose) 
                        VALUES (?, ?, ?, ?, ?)`;

            db.query(sql, [resource_id, date, start_time, end_time, purpose], (err) => {
                if (err) {
                    return res.status(500).send('Error inserting data: ' + err.message);
                }

                res.send(`
                    added successfully:<br>
                    resource id: ${resource_id}<br>
                    date: ${date}<br>
                    start time: ${start_time}:00<br>
                    end time: ${end_time}:00<br>
                    purpose: ${purpose}<br>
                    Redirecting in 2 seconds...
                    <script>
                        setTimeout(() => {
                            window.location.href = '/page1.html';
                        }, 2000);
                    </script>
                `);
            });
        });
    });
});

//lab booking
app.post('/submit/lab_booking', (req, res) => {
    const resource_id = req.body.resource_id;
    const date = req.body.date;
    const start_time = Number(req.body.start_time);
    const end_time = Number(req.body.end_time);
    let equipment = req.body.equipment;
    const additional_equipment = req.body.additional_equipment;
    const purpose = req.body.purpose;

    if(equipment==null){
        equipment=["no equipment"]
    }else if (!Array.isArray(equipment)) {
        equipment = [equipment]; // turn single item into array
    }
    equipment = JSON.stringify(equipment);

    if (end_time <= start_time) {
        return res.send(`<script>
            alert('End time must be later than start time.');
            window.location.href = '/lab_booking.html';
        </script>`);
    }

    const checksql = `SELECT COUNT(*) AS count FROM resource WHERE resource_id=?`;

    //Check if resource exists
    db.query(checksql, [resource_id], (err, results) => {
        if (err) {
            return res.status(500).send('Error checking resource id');
        }
        if (results[0].count == 0) {
            return res.send(`<script>
                alert('Resource ID does not exist. Please choose a different ID.');
                window.location.href = '/lab_booking.html';
            </script>`);
        }

        //Check resource type NOW inside callback
        const checktypesql = `SELECT resource_type FROM resource WHERE resource_id=?`;

        db.query(checktypesql, [resource_id], (err, rows) => {
            if (err) {
                return res.status(500).send('Error checking resource type');
            }

            if (rows[0].resource_type !== "lab") {
                return res.send(`<script>
                    alert('Resource ID is not a lab. Please choose a different ID.');
                    window.location.href = '/lab_booking.html';
                </script>`);
            }

            //Insert booking ONLY after type check succeeds
            const sql = `INSERT INTO lab_booking 
                        (resource_id, date, start_time, end_time, equipment, additional_equipment, purpose) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`;

            db.query(sql, [resource_id, date, start_time, end_time, equipment, additional_equipment, purpose], (err) => {
                if (err) {
                    return res.status(500).send('Error inserting data: ' + err.message);
                }

                res.send(`
                    added successfully:<br>
                    resource id: ${resource_id}<br>
                    date: ${date}<br>
                    start time: ${start_time}:00<br>
                    end time: ${end_time}:00<br>
                    equipment: ${equipment}<br>
                    additional_equipment: ${additional_equipment}<br>
                    purpose: ${purpose}<br>
                    Redirecting in 2 seconds...
                    <script>
                        setTimeout(() => {
                            window.location.href = '/page1.html';
                        }, 2000);
                    </script>
                `);
            });
        });
    });
});

//equipment booking
app.post('/submit/equipment_booking', (req, res) => {
    const resource_id = req.body.resource_id;
    const date = req.body.date;
    const start_time = Number(req.body.start_time);
    const end_time = Number(req.body.end_time);
    const purpose = req.body.purpose;

    if (end_time <= start_time) {
        return res.send(`<script>
            alert('End time must be later than start time.');
            window.location.href = '/Specialized_equipment_booking.html';
        </script>`);
    }

    const checksql = `SELECT COUNT(*) AS count FROM resource WHERE resource_id=?`;

    //Check if resource exists
    db.query(checksql, [resource_id], (err, results) => {
        if (err) {
            return res.status(500).send('Error checking resource id');
        }
        if (results[0].count == 0) {
            return res.send(`<script>
                alert('Resource ID does not exist. Please choose a different ID.');
                window.location.href = '/Specialized_booking.html';
            </script>`);
        }

        //Check resource type NOW inside callback
        const checktypesql = `SELECT resource_type FROM resource WHERE resource_id=?`;

        db.query(checktypesql, [resource_id], (err, rows) => {
            if (err) {
                return res.status(500).send('Error checking resource type');
            }

            if (rows[0].resource_type !== "equipment") {
                return res.send(`<script>
                    alert('Resource ID is not a equipment. Please choose a different ID.');
                    window.location.href = '/Specialized_equipment_booking.html';
                </script>`);
            }

            //Insert booking ONLY after type check succeeds
            const sql = `INSERT INTO equipment_booking 
                        (resource_id, date, start_time, end_time, purpose) 
                        VALUES (?, ?, ?, ?, ?)`;

            db.query(sql, [resource_id, date, start_time, end_time, purpose], (err) => {
                if (err) {
                    return res.status(500).send('Error inserting data: ' + err.message);
                }

                res.send(`
                    added successfully:<br>
                    resource id: ${resource_id}<br>
                    date: ${date}<br>
                    start time: ${start_time}:00<br>
                    end time: ${end_time}:00<br>
                    purpose: ${purpose}<br>
                    Redirecting in 2 seconds...
                    <script>
                        setTimeout(() => {
                            window.location.href = '/page1.html';
                        }, 2000);
                    </script>
                `);
            });
        });
    });
});

//sport facilities booking
app.post('/submit/Sports_Facilities_booking', (req, res) => {
    const resource_id = req.body.resource_id;
    const date = req.body.date;
    const start_time = Number(req.body.start_time);
    const end_time = Number(req.body.end_time);
    let equipment = req.body.equipment;
    const additional_equipment = req.body.additional_equipment;
    const purpose = req.body.purpose;

    if(equipment==null){
        equipment=["no equipment"]
    }else if (!Array.isArray(equipment)) {
        equipment = [equipment]; // turn single item into array
    }
    equipment = JSON.stringify(equipment);

    if (end_time <= start_time) {
        return res.send(`<script>
            alert('End time must be later than start time.');
            window.location.href = '/Sports_facilities_booking.html';
        </script>`);
    }

    const checksql = `SELECT COUNT(*) AS count FROM resource WHERE resource_id=?`;

    //Check if resource exists
    db.query(checksql, [resource_id], (err, results) => {
        if (err) {
            return res.status(500).send('Error checking resource id');
        }
        if (results[0].count == 0) {
            return res.send(`<script>
                alert('Resource ID does not exist. Please choose a different ID.');
                window.location.href = '/Sports_facilities_booking.html';
            </script>`);
        }

        //Check resource type NOW inside callback
        const checktypesql = `SELECT resource_type FROM resource WHERE resource_id=?`;

        db.query(checktypesql, [resource_id], (err, rows) => {
            if (err) {
                return res.status(500).send('Error checking resource type');
            }

            if (rows[0].resource_type !== "Sports_facilities") {
                return res.send(`<script>
                    alert('Resource ID is not a Sports Facilities. Please choose a different ID.');
                    window.location.href = '/Sports_facilities_booking.html';
                </script>`);
            }

            //Insert booking ONLY after type check succeeds
            const sql = `INSERT INTO sports_facilities_booking 
                        (resource_id, date, start_time, end_time, equipment, additional_equipment, purpose) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`;

            db.query(sql, [resource_id, date, start_time, end_time, equipment, additional_equipment, purpose], (err) => {
                if (err) {
                    return res.status(500).send('Error inserting data: ' + err.message);
                }

                res.send(`
                    added successfully:<br>
                    resource id: ${resource_id}<br>
                    date: ${date}<br>
                    start time: ${start_time}:00<br>
                    end time: ${end_time}:00<br>
                    equipment: ${equipment}<br>
                    additional_equipment: ${additional_equipment}<br>
                    purpose: ${purpose}<br>
                    Redirecting in 2 seconds...
                    <script>
                        setTimeout(() => {
                            window.location.href = '/page1.html';
                        }, 2000);
                    </script>
                `);
            });
        });
    });
});

//software_seat_booking booking
app.post('/submit/software_seat_booking', (req, res) => {
    const resource_id = req.body.resource_id;
    const date = req.body.date;
    const start_time = Number(req.body.start_time);
    const end_time = Number(req.body.end_time);
    const purpose = req.body.purpose;
    const software_access_method = req.body.software_access_method;

    if (end_time <= start_time) {
        return res.send(`<script>
            alert('End time must be later than start time.');
            window.location.href = '/software_seat_booking.html';
        </script>`);
    }

    const checksql = `SELECT COUNT(*) AS count FROM resource WHERE resource_id=?`;

    //Check if resource exists
    db.query(checksql, [resource_id], (err, results) => {
        if (err) {
            return res.status(500).send('Error checking resource id');
        }
        if (results[0].count == 0) {
            return res.send(`<script>
                alert('Resource ID does not exist. Please choose a different ID.');
                window.location.href = '/software_seat_booking.html';
            </script>`);
        }

        //Check resource type NOW inside callback
        const checktypesql = `SELECT resource_type FROM resource WHERE resource_id=?`;

        db.query(checktypesql, [resource_id], (err, rows) => {
            if (err) {
                return res.status(500).send('Error checking resource type');
            }

            if (rows[0].resource_type !== "software_seat") {
                return res.send(`<script>
                    alert('Resource ID is not a software seat. Please choose a different ID.');
                    window.location.href = '/software_seat_booking.html';
                </script>`);
            }

            //Insert booking ONLY after type check succeeds
            const sql = `INSERT INTO software_seat_booking 
                        (resource_id, date, start_time, end_time, purpose, software_access_method) 
                        VALUES (?, ?, ?, ?, ?, ?)`;

            db.query(sql, [resource_id, date, start_time, end_time, purpose, software_access_method], (err) => {
                if (err) {
                    return res.status(500).send('Error inserting data: ' + err.message);
                }

                res.send(`
                    added successfully:<br>
                    resource id: ${resource_id}<br>
                    date: ${date}<br>
                    start time: ${start_time}:00<br>
                    end time: ${end_time}:00<br>
                    purpose: ${purpose}<br>
                    software_access_method: ${software_access_method}<br>
                    Redirecting in 2 seconds...
                    <script>
                        setTimeout(() => {
                            window.location.href = '/page1.html';
                        }, 2000);
                    </script>
                `);
            });
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Go to: http://localhost:${PORT}/login_page.html`);
});
