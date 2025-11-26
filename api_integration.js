// api.js - Add this script to your HTML or include it as a separate file

const API_BASE_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('authToken') || null;
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null, requiresAuth = true) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (requiresAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const config = {
        method,
        headers
    };
    
    if (body) {
        config.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== AUTH FUNCTIONS ====================

async function login(email, password) {
    try {
        const data = await apiCall('/auth/login', 'POST', { email, password }, false);
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return data;
    } catch (error) {
        throw error;
    }
}

async function register(userData) {
    try {
        const data = await apiCall('/auth/register', 'POST', userData, false);
        return data;
    } catch (error) {
        throw error;
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
}

function isLoggedIn() {
    return authToken !== null;
}

function getCurrentUser() {
    return currentUser;
}

// ==================== PROFILE FUNCTIONS ====================

async function getProfile() {
    try {
        const data = await apiCall('/profile', 'GET');
        currentUser = data;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return data;
    } catch (error) {
        throw error;
    }
}

async function updateProfile(profileData) {
    try {
        const data = await apiCall('/profile', 'PUT', profileData);
        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return data;
    } catch (error) {
        throw error;
    }
}

async function changePassword(currentPassword, newPassword) {
    try {
        const data = await apiCall('/profile/password', 'PUT', { currentPassword, newPassword });
        return data;
    } catch (error) {
        throw error;
    }
}

// ==================== BOOKING FUNCTIONS ====================

async function getAllBookings() {
    try {
        const data = await apiCall('/bookings', 'GET');
        return data;
    } catch (error) {
        throw error;
    }
}

async function getBooking(id) {
    try {
        const data = await apiCall(`/bookings/${id}`, 'GET');
        return data;
    } catch (error) {
        throw error;
    }
}

async function createBooking(bookingData) {
    try {
        const data = await apiCall('/bookings', 'POST', bookingData);
        return data;
    } catch (error) {
        throw error;
    }
}

async function updateBooking(id, bookingData) {
    try {
        const data = await apiCall(`/bookings/${id}`, 'PUT', bookingData);
        return data;
    } catch (error) {
        throw error;
    }
}

async function deleteBooking(id) {
    try {
        const data = await apiCall(`/bookings/${id}`, 'DELETE');
        return data;
    } catch (error) {
        throw error;
    }
}

// ==================== INTEGRATION WITH YOUR EXISTING CODE ====================

// Replace your existing functions with these API-connected versions

// UPDATE PROFILE - Replace updateProfileNow()
async function updateProfileNow() {
    console.log('=== UPDATE PROFILE NOW (WITH API) ===');
    
    const newName = document.getElementById('inputName').value.trim();
    const newEmail = document.getElementById('inputEmail').value.trim();
    const newPhone = document.getElementById('inputPhone').value.trim();
    
    console.log('New profile values:', {newName, newEmail, newPhone});
    
    // Validation
    if (!newName) {
        alert('❌ Please enter a name!');
        return;
    }
    if (!newEmail) {
        alert('❌ Please enter an email!');
        return;
    }
    if (!newPhone) {
        alert('❌ Please enter a phone!');
        return;
    }
    
    try {
        // Call API
        const result = await updateProfile({
            name: newName,
            email: newEmail,
            phone: newPhone
        });
        
        // Update the display section
        document.getElementById('displayName').textContent = newName;
        document.getElementById('displayEmail').textContent = newEmail;
        document.getElementById('displayPhone').textContent = newPhone;
        
        // Also update the top bar user info
        const userInfoName = document.querySelector('.user-info p:last-child');
        if (userInfoName) {
            userInfoName.textContent = newName;
        }
        
        console.log('Profile display updated');
        
        // Show success alert
        const alertEl = document.getElementById('profileAlert');
        alertEl.textContent = '✅ Profile saved successfully!';
        alertEl.className = 'alert show alert-success';
        
        setTimeout(() => {
            alertEl.classList.remove('show');
        }, 3000);
        
        console.log('=== UPDATE PROFILE END - SUCCESS ===');
        
    } catch(error) {
        console.error('Error updating profile:', error);
        alert('❌ Error saving profile: ' + error.message);
    }
}

// UPDATE PASSWORD - Replace updatePasswordNow()
async function updatePasswordNow() {
    console.log('=== UPDATE PASSWORD NOW (WITH API) ===');
    
    const currentPass = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    
    console.log('Password validation');
    
    // Validation
    if (!currentPass) {
        alert('❌ Please enter current password!');
        return;
    }
    if (!newPass) {
        alert('❌ Please enter new password!');
        return;
    }
    if (!confirmPass) {
        alert('❌ Please confirm password!');
        return;
    }
    if (newPass !== confirmPass) {
        alert('❌ Passwords do not match!');
        return;
    }
    if (newPass.length < 6) {
        alert('❌ Password must be at least 6 characters!');
        return;
    }
    
    try {
        // Call API
        await changePassword(currentPass, newPass);
        
        console.log('Password validation passed');
        
        // Show success alert
        const alertEl = document.getElementById('passwordAlert');
        alertEl.textContent = '✅ Password changed successfully!';
        alertEl.className = 'alert show alert-success';
        
        // Reset form
        resetPasswordForm();
        
        setTimeout(() => {
            alertEl.classList.remove('show');
        }, 3000);
        
        console.log('=== UPDATE PASSWORD END - SUCCESS ===');
        
    } catch(error) {
        console.error('Error changing password:', error);
        alert('❌ Error changing password: ' + error.message);
    }
}

// CREATE BOOKING - Replace createNewBooking()
async function createNewBooking() {
    console.log('Create booking button clicked (WITH API)');
    
    const resource = document.getElementById('selectResource').value;
    const date = document.getElementById('selectDate').value;
    const time = document.getElementById('selectTime').value;
    const purpose = document.getElementById('selectPurpose').value;
    const people = document.getElementById('selectPeople').value;
    const notes = document.getElementById('selectNotes').value;
    
    console.log('Values:', {resource, date, time, purpose, people, notes});
    
    // Validation
    if (!resource) {
        showAlert('bookingFormAlert', '❌ Please select a resource!', 'error');
        return;
    }
    if (!date) {
        showAlert('bookingFormAlert', '❌ Please select a date!', 'error');
        return;
    }
    if (!time) {
        showAlert('bookingFormAlert', '❌ Please select a time!', 'error');
        return;
    }
    if (!purpose) {
        showAlert('bookingFormAlert', '❌ Please select a purpose!', 'error');
        return;
    }
    
    try {
        // Call API
        const result = await createBooking({
            resource,
            date,
            time,
            purpose,
            people: parseInt(people) || 1,
            notes
        });
        
        console.log('Booking added:', result.booking);
        
        showAlert('bookingFormAlert', '✅ Booking created successfully!', 'success');
        
        // Reset form
        resetBookingForm();
        
        // Go to bookings after 1.5 seconds
        setTimeout(() => {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
            document.getElementById('bookings').classList.add('active');
            document.querySelectorAll('.nav-link')[1].classList.add('active');
            document.getElementById('pageTitle').textContent = 'My Bookings';
            displayBookings();
        }, 1500);
        
    } catch(error) {
        console.error('Error:', error);
        showAlert('bookingFormAlert', '❌ Error creating booking: ' + error.message, 'error');
    }
}

// DISPLAY BOOKINGS - Replace displayBookings()
async function displayBookings() {
    console.log('Displaying bookings (FROM API)...');
    const list = document.getElementById('bookingsList');
    
    try {
        // Fetch bookings from API
        const bookings = await getAllBookings();
        
        if (bookings.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><h3>No bookings yet</h3></div>';
            return;
        }
        
        list.innerHTML = bookings.map(b => `
            <div class="booking-card">
                <div class="booking-info">
                    <div class="booking-field">
                        <div class="booking-field-label">Resource</div>
                        <div class="booking-field-value">📦 ${b.resource}</div>
                    </div>
                    <div class="booking-field">
                        <div class="booking-field-label">Date</div>
                        <div class="booking-field-value">${new Date(b.date).toLocaleDateString()}</div>
                    </div>
                    <div class="booking-field">
                        <div class="booking-field-label">Time</div>
                        <div class="booking-field-value">${b.time}</div>
                    </div>
                    <div class="booking-field">
                        <div class="booking-field-label">Purpose</div>
                        <div class="booking-field-value">${b.purpose}</div>
                    </div>
                    <div class="booking-field">
                        <div class="booking-field-label">People</div>
                        <div class="booking-field-value">${b.people}</div>
                    </div>
                    <div class="booking-field">
                        <div class="booking-field-label">Notes</div>
                        <div class="booking-field-value">${b.notes || 'N/A'}</div>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="btn btn-primary btn-sm" onclick="openEditModal(${b.id})">✏️ Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBookingNow(${b.id})">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    } catch(error) {
        console.error('Error loading bookings:', error);
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">❌</div><h3>Error loading bookings</h3></div>';
    }
}

// SAVE EDITED BOOKING - Replace saveEditedBooking()
async function saveEditedBooking() {
    console.log('=== SAVE EDITED BOOKING (WITH API) ===');
    
    const bookingId = parseInt(document.getElementById('editingBookingId').value);
    const resource = document.getElementById('editResource').value;
    const date = document.getElementById('editDate').value;
    const time = document.getElementById('editTime').value;
    const purpose = document.getElementById('editPurpose').value;
    const people = document.getElementById('editPeople').value;
    const notes = document.getElementById('editNotes').value;
    
    console.log('Booking ID to save:', bookingId);
    console.log('Values to save:', {resource, date, time, purpose, people, notes});
    
    // Validation
    if (!resource || !date || !time || !purpose) {
        alert('❌ Please fill all required fields!');
        return;
    }
    
    try {
        // Call API
        const result = await updateBooking(bookingId, {
            resource,
            date,
            time,
            purpose,
            people: parseInt(people) || 1,
            notes
        });
        
        console.log('Booking updated:', result.booking);
        
        // Close modal and refresh
        document.getElementById('editModal').classList.remove('active');
        await displayBookings();
        alert('✅ Booking saved successfully!');
        
        console.log('=== SAVE COMPLETE ===');
    } catch(error) {
        console.error('Error updating booking:', error);
        alert('❌ Error updating booking: ' + error.message);
    }
}

// DELETE BOOKING - Replace deleteBooking()
async function deleteBookingNow(id) {
    if (!confirm('Delete this booking?')) return;
    
    try {
        await deleteBooking(id);
        await displayBookings();
        showAlert('bookingsAlert', '✅ Booking deleted successfully!', 'success');
    } catch(error) {
        console.error('Error deleting booking:', error);
        showAlert('bookingsAlert', '❌ Error deleting booking: ' + error.message, 'error');
    }
}

// LOAD USER PROFILE ON PAGE LOAD
async function loadUserProfile() {
    if (!isLoggedIn()) {
        // Redirect to login or show login form
        console.log('User not logged in');
        // For now, use mock login
        try {
            await login('alex.johnson@concordia.ca', 'password123');
            console.log('Auto-logged in for development');
        } catch(error) {
            console.error('Auto-login failed:', error);
            return;
        }
    }
    
    try {
        const profile = await getProfile();
        
        // Update profile display
        document.getElementById('displayName').textContent = profile.name;
        document.getElementById('displayEmail').textContent = profile.email;
        document.getElementById('displayPhone').textContent = profile.phone;
        
        // Update input fields
        document.getElementById('inputName').value = profile.name;
        document.getElementById('inputEmail').value = profile.email;
        document.getElementById('inputPhone').value = profile.phone;
        
        // Update top bar
        const userInfoName = document.querySelector('.user-info p:last-child');
        if (userInfoName) {
            userInfoName.textContent = profile.name;
        }
        
        console.log('Profile loaded:', profile);
    } catch(error) {
        console.error('Error loading profile:', error);
    }
}

// Initialize on page load
window.addEventListener('load', () => {
    loadUserProfile();
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('selectDate');
    if (dateInput) {
        dateInput.min = today;
        dateInput.valueAsDate = new Date();
    }
});