import express from 'express';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-memory data
let currentUser = null;
const users = [];

const sunnahs = [
  "Pray the five daily prayers (Salah) 🕌",
  "Recite Surah Al-Fatihah in every unit of prayer (Rak'ah) 📖",
  "Perform Wudu (ablution) properly before prayer 💧",
  "Send salutations (Salawat) upon the Prophet Muhammad (PBUH) 🕋",
  "Maintain ties of kinship and family relationships 👪",
  "Read and reflect upon the Qur'an regularly 📖",
  "Smile at others as an act of charity 😊",
  "Eat with the right hand 🍽️",
  "Say 'Bismillah' before starting any action 🏷️",
  "Offer the Sunnah prayers before and after the obligatory prayers 🙏",
  "Be kind and respectful to parents 👩‍👧‍👦",
  "Visit the sick 🏥",
  "Provide charity to the needy (Sadaqah) 💰",
  "Help others in need (whether financially or by offering assistance) 🤝",
  "Seek knowledge and encourage others to do the same 📚",
  "Offer prayers for others, even when they are not present 🧕",
  "Perform the voluntary night prayer (Tahajjud) 🌙",
  "Pray for forgiveness during the last third of the night 🌒",
  "Wear clean and modest clothing 👗",
  "Maintain good manners and speech 🗣️",
  "Offer a kind word to others, even in difficult situations 💬",
  "Use miswak or a toothbrush to clean the teeth 🪥",
  "Break the fast with dates and water 🌙",
  "Have a meal with others, sharing food 🍽️",
  "Fast on Mondays and Thursdays 🌙",
  "Use the right foot to enter the house and the left foot to exit 🏠",
  "Recite 'SubhanAllah' (Glory be to Allah) 33 times, 'Alhamdulillah' (All praise be to Allah) 33 times, and 'Allahu Akbar' (Allah is the Greatest) 34 times after every prayer 🕊️",
  "Perform Dhikr (remembrance of Allah) regularly 🧘‍♂️",
  "Pray two units of prayer (Rak'ahs) after Wudu 💧",
  "Give a greeting of peace (Salam) to others when you meet them ✋"
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

// Middleware to inject currentUser into all templates
app.use((req, res, next) => {
  res.locals.currentUser = currentUser;
  next();
});

// Utility to get a random Sunnah
function getRandomSunnah() {
  return sunnahs[Math.floor(Math.random() * sunnahs.length)];
}

// Utility to get a random hadith with fallback
async function getRandomHadith() {
  try {
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const response = await axios.get(`https://api.hadith.gading.dev/books/muslim/${randomNumber}`);
    const hadith = response.data.data;

    if (!hadith || !hadith.contents || !hadith.contents.arab) {
      return {
        content: 'No hadith available at this moment.',
        name: 'Please try again'
      };
    }

    return {
      content: hadith.contents.arab,
      name: hadith.name
    };
  } catch (error) {
    return {
      content: "Couldn't load hadith. Try again later.",
      name: 'Error'
    };
  }
}

// API endpoint for random Sunnah and Hadith
app.get('/api/get-random-sunnah-hadith', async (req, res) => {
  try {
    const sunnah = getRandomSunnah();
    const hadith = await getRandomHadith();
    res.json({ sunnah, hadith });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch data',
      sunnah: getRandomSunnah(),
      hadith: {
        content: "Couldn't load hadith. Try again later.",
        name: 'Error'
      }
    });
  }
});

// Routes
app.get('/', (req, res) => res.redirect('/login'));

// Auth Routes
app.get('/login', (req, res) => res.render('login'));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    currentUser = username;
    res.redirect('/dashboard');
  } else {
    res.status(400).send('Invalid credentials');
  }
});

app.get('/register', (req, res) => res.render('register'));

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }
  
  if (users.find(user => user.username === username)) {
    return res.status(409).send('User already exists. Please login.');
  }
  
  users.push({ username, password });
  res.redirect('/login');
});

app.post('/logout', (req, res) => {
  currentUser = null;
  res.redirect('/login');
});

// Dashboard (with Hadith & Sunnah)
app.get('/dashboard', async (req, res) => {
  const sunnah = getRandomSunnah();
  const hadith = await getRandomHadith();
  
  res.render('dashboard', {
    username: currentUser || 'Guest',
    sunnah,
    posts,
    hadith
  });
});

// Community
app.get('/community-posts', (req, res) => {
  res.render('community-posts', { posts });
});

app.get('/motivation', (req, res) => {
  res.render('motivation', { posts });
});

// Reflections main page
app.get('/reflections', (req, res) => {
  res.render('reflections', {
    reflections,
    currentUser: currentUser || 'Guest',
    allPosts: reflections
  });
});

app.post('/reflections', (req, res) => {
  const { content } = req.body;
  if (content && currentUser && currentUser !== 'Guest') {
    reflections.push({ id: Date.now(), username: currentUser, content });
  }
  res.redirect('/reflections');
});

// Edit Reflection (form page)
app.get('/reflections/:id/edit', (req, res) => {
  const id = parseInt(req.params.id);
  const reflectionToEdit = reflections.find(r => r.id === id);
  
  if (!reflectionToEdit) {
    return res.redirect('/reflections');
  }

  res.render('edit-reflections', {
    reflection: reflectionToEdit
  });
});

// Update Reflection
app.post('/reflections/:id/update', (req, res) => {
  const id = parseInt(req.params.id);
  const { username, content } = req.body;

  if (!content) {
    return res.status(400).send('Content is required');
  }

  reflections = reflections.map(r =>
    r.id === id ? { ...r, username, content } : r
  );

  res.redirect('/reflections');
});

// Delete Reflection
app.post('/reflections/:id/delete', (req, res) => {
  const id = parseInt(req.params.id);
  reflections = reflections.filter(r => r.id !== id);
  res.redirect('/reflections');
});

// Done route
app.post('/done', (req, res) => {
  res.redirect('/reflections');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});