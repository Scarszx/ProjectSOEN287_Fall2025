console.log("room_calendar.js loaded");

// ==========================
// Global variables
// ==========================
let roomBookings = [];
let schoolCloseDates = [];

// ==========================
// Helper: Get start of week (Sunday)
// ==========================
function getStartOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
}

// ==========================
// Fetch room bookings for selected room
// ==========================
async function fetchRoomBookings(roomId, weekStart) {
    console.log("Fetching bookings for room:", roomId);
    try {
        const res = await fetch(`/api/room_bookings/${roomId}`);
        roomBookings = await res.json();
        console.log("Room bookings data:", roomBookings);
        updateCalendar(weekStart);
    } catch (err) {
        console.error("Error fetching room bookings:", err);
    }
}

// ==========================
// Fetch school closed dates
// ==========================
async function fetchSchoolCloseDates(weekStart) {
    console.log("Fetching school closed dates");
    try {
        const res = await fetch('/api/school_close_dates');
        schoolCloseDates = await res.json();
        console.log("School closed dates:", schoolCloseDates);
        updateCalendar(weekStart);
    } catch (err) {
        console.error("Error fetching school closed dates:", err);
    }
}

// ==========================
// Update calendar
// ==========================
function updateCalendar(weekStart) {
    console.log("Updating calendar for week starting:", weekStart);

    // Update the week picker input
    const weekPicker = document.getElementById('week-picker');
    weekPicker.value = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD

    const headerRow = document.getElementById('week-days-header');
    const tbody = document.getElementById('time-slots-body');

    headerRow.innerHTML = '<th>Time</th>';
    tbody.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        let d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);

        const dateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD

        let th = document.createElement('th');
        th.textContent = d.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        headerRow.appendChild(th);
    }

    for (let hour = 8; hour <= 18; hour++) {
        let tr = document.createElement('tr');

        let timeTd = document.createElement('td');
        timeTd.textContent = `${hour}:00`;
        tr.appendChild(timeTd);

        for (let i = 0; i < 7; i++) {
            let d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            const cellDateStr = d.toLocaleDateString('en-CA');

            let cell = document.createElement('td');
            cell.id = `cell-${cellDateStr}-${hour}`;
            cell.textContent = 'free';
            cell.style.backgroundColor = '#ccff90'; // light green
            

            // Room bookings
            roomBookings.forEach(b => {
                const bookingDateStr = new Date(b.date).toLocaleDateString('en-CA');
                if (bookingDateStr === cellDateStr && hour >= b.start_time && hour < b.end_time) {
                    cell.textContent = b.status || 'Booked';
                    switch(b.status) {
                        case 'free':
                            cell.style.backgroundColor = '#ccff90';
                            break;
                        case 'booked':
                            cell.style.backgroundColor = '#f28b82';
                            break;
                        case 'maintenance':
                            cell.style.backgroundColor = '#ffd180';
                            break;
                        case 'not_avaliable_for_other_reasons':
                            cell.style.backgroundColor ='#BCC6CC';
                            break;
                        default:
                            cell.style.backgroundColor = '#ccff90';
                            cell.textContent = 'free';
        }
                }
            });

            // School closed
            if (schoolCloseDates.includes(cellDateStr)) {
                cell.textContent = 'School Closed';
                cell.style.backgroundColor = 'grey';
            }

            tr.appendChild(cell);
        }

        tbody.appendChild(tr);
    }
}

// ==========================
// Event listeners
// ==========================
document.getElementById('prev-week').addEventListener('click', () => {
    const weekPicker = document.getElementById('week-picker');
    const weekStart = getStartOfWeek(new Date(weekPicker.value || new Date()));
    weekStart.setDate(weekStart.getDate() - 7);
    updateCalendar(weekStart);
});

document.getElementById('next-week').addEventListener('click', () => {
    const weekPicker = document.getElementById('week-picker');
    const weekStart = getStartOfWeek(new Date(weekPicker.value || new Date()));
    weekStart.setDate(weekStart.getDate() + 7);
    updateCalendar(weekStart);
});

document.getElementById('week-picker').addEventListener('change', (e) => {
    const selectedDate = new Date(e.target.value);
    const weekStart = getStartOfWeek(selectedDate);
    updateCalendar(weekStart);
});

document.getElementById('roomSelectionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const roomId = document.getElementById('roomNumber').value;
    if (!roomId) return alert('Please enter a room number');

    const weekStart = getStartOfWeek(new Date(document.getElementById('week-picker').value || new Date()));
    fetchRoomBookings(roomId, weekStart);
    fetchSchoolCloseDates(weekStart); // keep your schoolclose method
});

// ==========================
// Initial display
// ==========================
const initialWeekStart = getStartOfWeek(new Date());
updateCalendar(initialWeekStart);
fetchSchoolCloseDates(initialWeekStart);

