import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;
let currentUser = null;
const users = []; // Example: { username: 'zulaikha', password: '1234' }

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (like styles.css)
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));


// Sample data (temporary)
const posts = [
  { username: 'Zulaikha', content: 'Revived the Sunnah of eating with the right hand 🍽️', date: new Date() },
  { username: 'Fatima', content: 'Gave water to a cat 🐱', date: new Date() }
];


// Sample reflections array (fake data for now)
const reflections = [
  { id: 1, username: 'Zulaikha', content: 'It felt good to smile intentionally today 😊' },
  { id: 2, username: 'Fatima', content: 'I helped a neighbor quietly. Peaceful!' },
  { id: 3, username: 'Faham', content: 'Started with Bismillah today 🧕🏼' },
  { id: 4, username: 'Zuhra', content: 'Smiled at a stranger 😊' },
  { id: 5, username: 'Tabinda', content: 'Gave salaam first today 👋🏼' }
];

const sunnahs = [
  "Use miswak before every prayer 🪥",
  "Say Bismillah before eating 🍽️",
  "Smile at someone today 😊",
  "Say Salam to a stranger 🕊️",
  "Help someone without expecting reward 🤝",
  "Sleep on your right side 😴"
];

// Show register form
app.get('/register', (req, res) => {
  res.render('register');
});

// Handle form submission
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Check if user already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.send('User already exists. Please login.');
  }

  // Store new user
  users.push({ username, password });
  console.log('Users:', users); // For testing
  res.redirect('/login');
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // ✅ Temporarily accept any username/password
  if (username && password) {
    currentUser = username;
    res.redirect('/dashboard');
  } else {
    res.send('Invalid credentials');
  }
});
app.post('/logout', (req, res) => {
  currentUser = null;
  res.redirect('/login');
});

app.get('/dashboard', (req, res) => {
  if (!currentUser) {
    return res.redirect('/login');
  }

  res.render('dashboard', {
    username: currentUser,
    sunnah: null, // optional for now
    posts: [], // optional
  });
});

// Routes
// Redirect from root
app.get('/', (req, res) => {
  res.redirect('/login');
});

// GET login page
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});
app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    username: 'Zulaikha', // or pull this from session later
    sunnah: null,
    posts
  });
});

app.get('/get-sunnah', (req, res) => {
  res.render('get-sunnah', { sunnah: null });
});

app.post('/get-sunnah', (req, res) => {
  const randomSunnah = sunnahs[Math.floor(Math.random() * sunnahs.length)];
  res.render('get-sunnah', { sunnah: randomSunnah });
});

app.get('/get-sunnah', (req, res) => {
  const randomSunnah = sunnahs[Math.floor(Math.random() * sunnahs.length)];
  res.render('dashboard', {
    username: req.session.username,
    sunnah: randomSunnah,
    posts: reflections
  });
});



app.get('/motivation', (req, res) => {
  res.render('motivation', { posts });
});



app.get('/community-posts', (req, res) => {
  res.render('community-posts', { posts });
});

app.get('/reflections', (req, res) => {
  res.render('reflections', {
    reflections,
    currentUser: req.session.username
  });
});




app.post('/reflections', (req, res) => {
  const { content } = req.body;
  const username = req.session.username;
  const newReflection = {
    id: Date.now(),
    username,
    content
  };
  reflections.push(newReflection);
  res.redirect('/reflections');
});

// Edit form
app.get('/reflections/:id/edit', (req, res) => {
  const id = parseInt(req.params.id);
  const reflection = reflections.find(r => r.id === id);
  if (!reflection) return res.send("Not found");
  res.render('edit-reflection', { reflection });
});

// Update reflection
app.post('/reflections/:id/update', express.urlencoded({ extended: true }), (req, res) => {
  const id = parseInt(req.params.id);
  const { username, content } = req.body;
  reflections = reflections.map(r =>
    r.id === id ? { ...r, username, content } : r
  );
  res.redirect('/reflections');
});

// Delete reflection
app.post('/reflections/:id/delete', (req, res) => {
  const id = parseInt(req.params.id);
  reflections = reflections.filter(r => r.id !== id);
  res.redirect('/reflections');
});

// Start server
app.listen(PORT, () => {
  console.log(` http://localhost:${PORT}`);
});
