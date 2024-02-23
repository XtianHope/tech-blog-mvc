const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const routes = require('./routes');
const helpers = require('./utils/helpers');
const db = require('./models');

const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
const PORT = process.env.PORT || 3001;

const hbs = exphbs.create({ helpers });

const sess = {
  secret: 'Super secret secret',
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize
  })
};

app.use(session(sess));

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/dashboard', async (req, res) => {
  try {
    const posts = await db.Post.findAll();
    res.render('dashboard', { posts });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/dashboard', async (req, res) => {
  try {
    const newPost = await db.Post.create({
      title: req.body.title,
      content: req.body.content,
    });
    res.redirect('/dashboard');
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get('/signup', (req, res) => {
  res.render('signup');
});


sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Now listening at http://localhost:' + PORT));
});