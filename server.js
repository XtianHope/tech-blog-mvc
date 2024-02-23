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

app.get('/', async (req, res) => {
  try {
    const posts = await db.Post.findAll({ include: db.User });
    res.render('index', { posts });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get('/dashboard', async (req, res) => {
  try {
    if (!req.session.logged_in) {
      res.redirect('/login');
      return;
    }

    const posts = await db.Post.findAll({ where: { user_id: req.session.user_id } });
    res.render('dashboard', { posts });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/dashboard', async (req, res) => {
  try {
    if (!req.session.logged_in) {
      res.redirect('/login');
      return;
    }

    const newPost = await db.Post.create({
      title: req.body.title,
      content: req.body.content,
      user_id: req.session.user_id,
      username: req.session.username,
      createdAt: new Date()
    });
    res.redirect('/dashboard');
  } catch (err) {
    res.status(500).json(err);
  }
});


app.put('/dashboard/:id', async (req, res) => {
  try {
    const updatedPost = await db.Post.update({
      title: req.body.title,
      content: req.body.content,
    }, {
      where: {
        id: req.params.id,
        user_id: req.session.user_id
      }
    });
    if (updatedPost[0] === 0) {
      return res.status(403).send("You are not authorized to edit this post.");
    }
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


app.post('/login', async (req, res) => {
  try {
    const user = await db.User.findOne({ where: { email: req.body.email } });
    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(401).send("Invalid email or password");
    }
    req.session.user_id = user.id;
    req.session.logged_in = true;
    req.session.username = user.username;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    res.redirect('/');
  });
});


app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const newUser = await db.User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });
    req.session.user_id = newUser.id;
    req.session.logged_in = true;
    req.session.username = newUser.username;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Now listening at http://localhost:' + PORT));
});