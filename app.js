import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware & Settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Fake authentication system
let currentUser = null;
const users = []; // { username: 'zulaikha', password: '1234' }

// Sample Sunnah data
const sunnahs = [
  "Use miswak before every prayer 🪥",
  "Say Bismillah before eating 🍽️",
  "Smile at someone today 😊",
  "Say Salam to a stranger 🕊️",
  "Help someone without expecting reward 🤝",
  "Sleep on your right side 😴"
];

// Posts & Reflections
const posts = [
  { username: 'Zulaikha', content: 'Revived the Sunnah of eating with the right hand 🍽️', date: new Date() },
  { username: 'Fatima', content: 'Gave water to a cat 🐱', date: new Date() }
];

let reflections = [
  { id: 1, username: 'Zulaikha', content: 'It felt good to smile intentionally today 😊' },
  { id: 2, username: 'Fatima', content: 'I helped a neighbor quietly. Peaceful!' },
  { id: 3, username: 'Faham', content: 'Started with Bismillah today 🧕🏼' },
  { id: 4, username: 'Zuhra', content: 'Smiled at a stranger 😊' },
  { id: 5, username: 'Tabinda', content: 'Gave salaam first today 👋🏼' }
];

// 🔥 Inject currentUser into all views
app.use((req, res, next) => {
  res.locals.currentUser = currentUser;
  next();
});

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    currentUser = username;
    res.redirect('/dashboard');
  } else {
    res.send('Invalid credentials');
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.send('User already exists. Please login.');
  }
  users.push({ username, password });
  console.log('Users:', users);
  res.redirect('/login');
});

app.post('/logout', (req, res) => {
  currentUser = null;
  res.redirect('/login');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    username: currentUser || 'Guest',
    sunnah: null,
    posts
  });
});

app.post('/get-sunnah', (req, res) => {
  const randomSunnah = sunnahs[Math.floor(Math.random() * sunnahs.length)];
  res.render('dashboard', {
    username: currentUser,
    sunnah: randomSunnah,
    posts
  });
});

app.get('/motivation', (req, res) => {
  res.render('motivation', { posts });
});

app.get('/community-posts', (req, res) => {
  res.render('community-posts', { posts });
});

app.get('/reflections', (req, res) => {
  const username = currentUser || "Guest";
  res.render('reflections', {
    reflections,
    currentUser: username,
    allPosts: reflections
  });
});

app.post('/reflections', (req, res) => {
  const { content } = req.body;
  const username = currentUser;
  const newReflection = {
    id: Date.now(),
    username,
    content
  };
  reflections.push(newReflection);
  res.redirect('/reflections');
});

app.get('/reflections/:id/edit', (req, res) => {
  const id = parseInt(req.params.id);
  const reflection = reflections.find(r => r.id === id);
  if (!reflection) return res.send("Not found");
  res.render('edit-reflection', { reflection });
});

app.post('/reflections/:id/update', (req, res) => {
  const id = parseInt(req.params.id);
  const { username, content } = req.body;
  reflections = reflections.map(r =>
    r.id === id ? { ...r, username, content } : r
  );
  res.redirect('/reflections');
});

app.post('/reflections/:id/delete', (req, res) => {
  const id = parseInt(req.params.id);
  reflections = reflections.filter(r => r.id !== id);
  res.redirect('/reflections');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
