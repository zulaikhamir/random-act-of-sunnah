// ✨ Your existing imports and setup...
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✨ Middleware setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✨ In-memory data
let currentUser = null;
const users = [];

const sunnahs = [
  "Use miswak before every prayer 🪥",
  "Say Bismillah before eating 🍽️",
  "Smile at someone today 😊",
  "Say Salam to a stranger 🕊️",
  "Help someone without expecting reward 🤝",
  "Sleep on your right side 😴"
];

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

// ✨ Middleware to inject currentUser into all templates
app.use((req, res, next) => {
  res.locals.currentUser = currentUser;
  next();
});

// ✨ Utility
function getRandomSunnah() {
  return sunnahs[Math.floor(Math.random() * sunnahs.length)];
}

// ✨ Routes

app.get('/', (req, res) => res.redirect('/login'));

// ✨ Auth Routes
app.get('/login', (req, res) => res.render('login'));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    currentUser = username;
    res.redirect('/dashboard');
  } else {
    res.send('Invalid credentials');
  }
});

app.get('/register', (req, res) => res.render('register'));

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(user => user.username === username)) {
    return res.send('User already exists. Please login.');
  }
  users.push({ username, password });
  res.redirect('/login');
});

app.post('/logout', (req, res) => {
  currentUser = null;
  res.redirect('/login');
});

// ✨ Dashboard
app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    username: currentUser || 'Guest',
    sunnah: null,
    posts
  });
});

// ✨ Get random sunnah (AJAX)
app.post('/get-sunnah', (req, res) => {
  const sunnah = getRandomSunnah();
  res.json({ sunnah });
});

// ✨ Community
app.get('/community-posts', (req, res) => {
  res.render('community-posts', { posts });
});

app.get('/motivation', (req, res) => {
  res.render('motivation', { posts });
});

// ✨ Reflections main page
app.get('/reflections', (req, res) => {
  res.render('reflections', {
    reflections,
    currentUser: currentUser || 'Guest',
    allPosts: reflections
  });
});

app.post('/reflections', (req, res) => {
  const { content } = req.body;
  if (currentUser && currentUser !== 'Guest') {
    reflections.push({ id: Date.now(), username: currentUser, content });
  }
  res.redirect('/reflections');
});

// ✨ Edit Reflection (form page)
app.get('/reflections/:id/edit', (req, res) => {
  const id = parseInt(req.params.id);
  const reflectionToEdit = reflections.find(r => r.id === id);
  if (!reflectionToEdit) return res.redirect('/reflections');

  res.render('edit-reflections', {
    reflection: reflectionToEdit
  });
});

// ✨ Update Reflection
app.post('/reflections/:id/update', (req, res) => {
  const id = parseInt(req.params.id);
  const { username, content } = req.body;

  reflections = reflections.map(r =>
    r.id === id ? { ...r, username, content } : r
  );

  res.redirect('/reflections');
});


// ✨ Delete Reflection
app.post('/reflections/:id/delete', (req, res) => {
  const id = parseInt(req.params.id);
  reflections = reflections.filter(r => r.id !== id);
  res.redirect('/reflections');
});

// ✨ Done route
app.post('/done', (req, res) => {
  res.redirect('/reflections');
});

// ✨ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
