// creating some variables and setting up the server
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

const cookieParser = require('cookie-parser');
app.use(cookieParser());

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

// Routes
app.post('/api/register', (req, res) => {
    const { first_name, last_name, email, status, id_number, new_username, new_password } = req.body;
    const hashed = crypto.createHash('sha256').update(new_password).digest('hex');

    const sql = `INSERT INTO users (first_name, last_name, email, status, id_number, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [first_name, last_name, email, status, id_number, new_username, hashed], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.json({ success: false, message: 'Username/Email/ID already taken' });
            console.error(err);
            return res.json({ success: false, message: 'Database error' });
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
        res.cookie('studentId', user.id_number, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

        let redirect = '/page1.html';
        if (user.status === 'faculty') redirect = '/page1.html';
        if (user.status === 'resource_manager') redirect = '/page2.html';

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

//delete resource
app.post('/submit/delete_resource', (req, res) => {
    const { resource_id } = req.body;
    if (!resource_id) {
        return res.status(400).send('Resource ID is required');
    }

    const sql = 'DELETE FROM resource WHERE resource_id = ?';
    db.query(sql, [resource_id], (err, result) => {
        if (err) {
            return res.status(500).send('Error deleting resource: ' + err.message);
        }
        if (result.affectedRows === 0) {
            return res.send(`<script>
                alert('Resource ID not found.');
                window.location.href = '/delete_resource.html';
            </script>`);
        }
        res.send(`<script>
            alert('Resource deleted successfully.');
            window.location.href = '/page2.html';
        </script>`);
    });
});


//room booking
app.post('/submit/room_booking', (req, res) => {
    const resource_id = req.body.resource_id;
    const date = req.body.date;
    const start_time = Number(req.body.start_time);
    const end_time = Number(req.body.end_time);
    const purpose = req.body.purpose;
    const student_id = req.cookies.studentId;
    if (!student_id) {
        return res.status(401).send('No valid student ID cookie found. Please log in.');
    }

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
                        (resource_id, date, start_time, end_time, purpose, student_id) 
                        VALUES (?, ?, ?, ?, ?, ?)`;

            db.query(sql, [resource_id, date, start_time, end_time, purpose, student_id], (err) => {
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
                    student id: ${student_id}<br>
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
    const student_id = req.cookies.studentId;
    if (!student_id) {
        return res.status(401).send('No valid student ID cookie found. Please log in.');
    }

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
                        (resource_id, date, start_time, end_time, equipment, additional_equipment, purpose, student_id) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            db.query(sql, [resource_id, date, start_time, end_time, equipment, additional_equipment, purpose, student_id], (err) => {
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
                    student id: ${student_id}<br>
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
    const student_id = req.cookies.studentId;
    if (!student_id) {
        return res.status(401).send('No valid student ID cookie found. Please log in.');
    }

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
                        (resource_id, date, start_time, end_time, purpose, student_id) 
                        VALUES (?, ?, ?, ?, ?, ?)`;

            db.query(sql, [resource_id, date, start_time, end_time, purpose, student_id], (err) => {
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
                    student id: ${student_id}<br>
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
    const student_id = req.cookies.studentId;
    if (!student_id) {
        return res.status(401).send('No valid student ID cookie found. Please log in.');
    }

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
                        (resource_id, date, start_time, end_time, equipment, additional_equipment, purpose, student_id) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            db.query(sql, [resource_id, date, start_time, end_time, equipment, additional_equipment, purpose, student_id], (err) => {
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
                    student id: ${student_id}<br>
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
    const student_id = req.cookies.studentId;
    if (!student_id) {
        return res.status(401).send('No valid student ID cookie found. Please log in.');
    }

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
                        (resource_id, date, start_time, end_time, purpose, software_access_method, student_id) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`;

            db.query(sql, [resource_id, date, start_time, end_time, purpose, software_access_method, student_id], (err) => {
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
                    student id: ${student_id}<br>
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

//resource management
app.post('/submit/resource_management', (req, res) => {
    const resource_id = req.body.resource_id;
    const date = req.body.date;
    const start_time = Number(req.body.start_time);
    const end_time = Number(req.body.end_time);
    const Status = req.body.Status;

    if (end_time <= start_time) {
        return res.send(`<script>
            alert('End time must be later than start time.');
            window.location.href = '/resources_management.html';
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
                window.location.href = '/resources_management.html';
            </script>`);
        }

        //Insert booking ONLY after type check succeeds
        const sql = `INSERT INTO resource_status 
                    (resource_id, date, start_time, end_time, status) 
                    VALUES (?, ?, ?, ?, ?)`;
        db.query(sql, [resource_id, date, start_time, end_time, Status], (err) => {
            if (err) {
                return res.status(500).send('Error inserting data: ' + err.message);
            }
            res.send(`
                added successfully:<br>
                resource id: ${resource_id}<br>
                date: ${date}<br>
                start time: ${start_time}:00<br>
                end time: ${end_time}:00<br>
                status: ${Status}<br>
                Redirecting in 2 seconds...
                <script>
                    setTimeout(() => {
                        window.location.href = '/page2.html';
                    }, 2000);
                </script>
            `);
        });
    });
});

//resource management - school close
app.post('/submit/resource_management/schoolclose', (req, res) => {
    const date = req.body.date;
    const sql = `INSERT INTO schoolclose (date) VALUES (?)`;
    db.query(sql, [date], (err) => {
        if (err) {
            return res.status(500).send('Error inserting data: ' + err.message);
        }
        res.send(`
            added successfully:<br>
            date: ${date}<br>
            Redirecting in 2 seconds...
            <script>
                setTimeout(() => {
                    window.location.href = '/page2.html';
                }, 2000);
            </script>
        `);
    });
});

// resource management - school open
app.post('/submit/resource_management/schoolopen', (req, res) => {
    const date = req.body.date;
    const sql = `DELETE FROM schoolclose WHERE date = ?`;
    db.query(sql, [date], (err, result) => {
        if (err) {
            return res.status(500).send('Error deleting data: ' + err.message);
        }
        res.send(`
            school opened successfully:<br>
            date: ${date}<br>
            removed records: ${result.affectedRows}<br>
            Redirecting in 2 seconds...
            <script>
                setTimeout(() => {
                    window.location.href = '/page2.html';
                }, 2000);
            </script>
        `);
    });
});

//calendar control
// Get bookings for a room
app.get('/api/room_bookings/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const sql = 'SELECT date, start_time, end_time, status FROM resource_status WHERE resource_id=?';
  db.query(sql, [roomId], (err, results) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(results);
  });
});

// Get school closed dates
app.get('/api/school_close_dates', (req, res) => {
  const sql = 'SELECT date FROM schoolclose';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(results.map(r => r.date.toISOString().split('T')[0]));
  });
});

//get resource
app.get('/api/resources', (req, res) => {
    db.query('SELECT * FROM resource', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});
//personal bookings
function checkStudentIdCookie(req, res, next) {
  if (!req.cookies.studentId) {
    return res.status(401).json({ error: 'No valid student ID cookie found' });
  }
  next();
}

// Helper to get bookings by table
function getBookings(table, studentId, res) {
  const sql = `SELECT * FROM ${table} WHERE student_id = ?`;
  db.query(sql, [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
}

// Helper to delete booking by primary key fields and student_id
function deleteBooking(table, data, studentId, res) {
  let { resource_id, date, start_time, status } = data;
  // Convert date if needed
  if (typeof date === 'string' && date.includes('T')) {
    date = new Date(date).toISOString().split('T')[0];
  }

  console.log(`Deleting from ${table} where resource_id=${resource_id}, date=${date}, start_time=${start_time}, student_id=${studentId}`);

  // Perform delete
  const sql = `DELETE FROM ${table} WHERE resource_id = ? AND date = ? AND start_time = ? AND student_id = ?`;
  db.query(sql, [resource_id, date, start_time, studentId], (err, result) => {
    if (err) {
      console.error('Error executing delete:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      console.warn('No booking found to delete or unauthorized');
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    // If status is 1 (approved), delete related resource_status record
    console.log("status is", status);
if (status === 1) {
  const resourceSql = `DELETE FROM resource_status WHERE resource_id = ? AND date = ? AND start_time = ?`;
  console.log('Attempting to delete related resource_status with', { resource_id, date, start_time });
  db.query(resourceSql, [resource_id, date, start_time], (err, resDel) => {
    if (err) {
      console.error('Error deleting resource status:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Related resource status deletion result:', resDel);
    console.log('Related resource status deleted successfully.');
    return res.json({ success: true });
  });
} else {
  return res.json({ success: true });
}


  });
}

// GET routes for each booking type
app.get('/api/bookings/room', checkStudentIdCookie, (req, res) => {
  getBookings('room_booking', req.cookies.studentId, res);
});

app.get('/api/bookings/lab', checkStudentIdCookie, (req, res) => {
  getBookings('lab_booking', req.cookies.studentId, res);
});

app.get('/api/bookings/equipment', checkStudentIdCookie, (req, res) => {
  getBookings('equipment_booking', req.cookies.studentId, res);
});

app.get('/api/bookings/sports_facilities', checkStudentIdCookie, (req, res) => {
  getBookings('sports_facilities_booking', req.cookies.studentId, res);
});

app.get('/api/bookings/software_seat', checkStudentIdCookie, (req, res) => {
  getBookings('software_seat_booking', req.cookies.studentId, res);
});

// DELETE routes to cancel a booking for each booking type
app.delete('/api/bookings/room', checkStudentIdCookie, (req, res) => {
  deleteBooking('room_booking', req.body, req.cookies.studentId, res);
});

app.delete('/api/bookings/lab', checkStudentIdCookie, (req, res) => {
  deleteBooking('lab_booking', req.body, req.cookies.studentId, res);
});

app.delete('/api/bookings/equipment', checkStudentIdCookie, (req, res) => {
  deleteBooking('equipment_booking', req.body, req.cookies.studentId, res);
});

app.delete('/api/bookings/sports_facilities', checkStudentIdCookie, (req, res) => {
  deleteBooking('sports_facilities_booking', req.body, req.cookies.studentId, res);
});

app.delete('/api/bookings/software_seat', checkStudentIdCookie, (req, res) => {
  deleteBooking('software_seat_booking', req.body, req.cookies.studentId, res);
});



// Helper: Map booking type to table and resource join info
const bookingConfig = {
  room: { table: 'room_booking', resourceJoin: true },
  lab: { table: 'lab_booking', resourceJoin: true },
  equipment: { table: 'equipment_booking', resourceJoin: true },
  sports_facilities: { table: 'sports_facilities_booking', resourceJoin: true },
  software_seat: { table: 'software_seat_booking', resourceJoin: true }
};

// Helper to get pending bookings with student and resource join data
app.get('/api/bookings/pending/:type', (req, res) => {
  const type = req.params.type;
  if (!bookingConfig[type]) return res.status(400).json({ error: "Invalid booking type" });

  let sql = `
    SELECT b.*, r.resource_name, u.first_name, u.last_name 
    FROM ${bookingConfig[type].table} b
    LEFT JOIN resource r ON b.resource_id = r.resource_id
    LEFT JOIN users u ON b.student_id = u.id_number
    WHERE b.status = 0
  `;
  db.query(sql, [], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Check resource availability helper
function checkResourceAvailability(resource_id, date, start_time, end_time, callback) {
  // Check if date is school closed
  db.query('SELECT COUNT(*) as cnt FROM schoolclose WHERE date = ?', [date], (err, schoolCloseResults) => {
    if (err) return callback(err);
    if (schoolCloseResults[0].cnt > 0) return callback(null, false, 'Date is closed for school');

    // Check conflicting resource_status where not free
    const sqlStatus = `SELECT COUNT(*) AS cnt FROM resource_status 
      WHERE resource_id = ? AND date = ? 
      AND NOT (end_time <= ? OR start_time >= ?)
      AND (status != 'free')`;
    db.query(sqlStatus, [resource_id, date, start_time, end_time], (err, statusResults) => {
      if (err) return callback(err);
      if (statusResults[0].cnt > 0) return callback(null, false, 'Resource not free during requested time slot');
      callback(null, true);
    });
  });
}

// Approve booking endpoint
app.post('/api/bookings/approve', (req, res) => {
  const { bookingType, bookingId } = req.body;
  if (!bookingConfig[bookingType]) return res.status(400).json({ success: false, message: "Invalid booking type" });

  // First get booking info
  const sqlGet = `SELECT * FROM ${bookingConfig[bookingType].table} WHERE id = ? AND status = 0`;
  db.query(sqlGet, [bookingId], (err, bookings) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (bookings.length === 0) return res.status(404).json({ success: false, message: "Booking not found or already approved" });

    const b = bookings[0];
    checkResourceAvailability(b.resource_id, b.date, b.start_time, b.end_time, (err, available, reason) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (!available) return res.status(400).json({ success: false, message: reason });

      // Mark booking as approved (status=1)
      const sqlUpdate = `UPDATE ${bookingConfig[bookingType].table} SET status = 1 WHERE id = ?`;
      db.query(sqlUpdate, [bookingId], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        // Insert into resource_status as booked
        const sqlInsertStatus = `INSERT INTO resource_status (resource_id, date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)`;
        db.query(sqlInsertStatus, [b.resource_id, b.date, b.start_time, b.end_time, 'booked'], (err) => {
          if (err) return res.status(500).json({ success: false, message: "Booking approved but failed to update resource status: " + err.message });
          res.json({ success: true });
        });
      });
    });
  });
});

// Decline booking endpoint - deletes booking, no resource_status change
app.post('/api/bookings/decline', (req, res) => {
  const { bookingType, bookingId } = req.body;
  if (!bookingConfig[bookingType]) return res.status(400).json({ success: false, message: "Invalid booking type" });

  const sqlDelete = `DELETE FROM ${bookingConfig[bookingType].table} WHERE id = ? AND status = 0`;
  db.query(sqlDelete, [bookingId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Booking not found or already handled" });
    res.json({ success: true });
  });
});

// Get all current booked resource_status entries with status='booked'
app.get('/api/booked_resources', (req, res) => {
  const sql = "SELECT id, resource_id, date, start_time, end_time, status FROM resource_status WHERE status = 'booked'";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

// Cancel (delete) booked resource by resource_status id
app.post('/api/booked_resources/cancel', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ success: false, message: "ID required" });

  const sql = "DELETE FROM resource_status WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (result.affectedRows === 0) 
      return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true });
  });
});





//Statics files
app.use('/', express.static(path.join(__dirname, 'index.html')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Login page: http://localhost:${PORT}/login_page.html`);
});
