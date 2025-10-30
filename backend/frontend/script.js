let currentUser = null;

// --- LOGIN & REGISTER ---
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const runSection = document.getElementById('runSection');

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    });

    const data = await res.json();
    console.log('Login response:', data, res.ok);

    if (res.ok) {
      currentUser = data.username;
      alert('Login successful!');
      runSection.style.display = 'block'; // show run form after login
      document.getElementById('authForms').style.display = 'none'; // hide login/register
      fetchRuns(); // load existing runs
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Error connecting to server');
  }
});

registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;

  try {
    const res = await fetch('http://localhost:5000/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    });

    const data = await res.json();
    console.log('Register response:', data, res.ok);

    if (res.ok) {
      alert('Registered successfully! Please login.');
    } else {
      alert(data.message || 'Registration failed');
    }
  } catch (err) {
    console.error('Register error:', err);
    alert('Error connecting to server');
  }
});

// --- RUN SUBMISSION ---
const runForm = document.getElementById('runForm');
const runsList = document.getElementById('runsList');
const API_URL = 'http://localhost:5000/runs';

runForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentUser) return alert('Please login first!');

  const run = {
    user: currentUser, // username from login
    date: new Date(),
    distance: parseFloat(document.getElementById('distance').value),
    duration: parseFloat(document.getElementById('duration').value)
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(run)
    });

    if (res.ok) {
      runForm.reset();
      fetchRuns();
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to add run');
    }
  } catch (err) {
    console.error('Run submission error:', err);
    alert('Error connecting to server');
  }
});

// --- FETCH ALL RUNS ---
async function fetchRuns() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return console.error('Failed to fetch runs');

    const data = await res.json();
    runsList.innerHTML = '';
    data.forEach(run => {
      const pace = run.duration / run.distance;
      const li = document.createElement('li');
      li.textContent = `${run.user} | ${new Date(run.date).toLocaleDateString()} | ${run.distance} km | ${run.duration} min | Pace: ${pace.toFixed(2)} min/km`;
      runsList.appendChild(li);
    });
  } catch (err) {
    console.error('Fetch runs error:', err);
  }
}
