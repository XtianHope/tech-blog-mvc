const router = require("express").Router();
const { User } = require("../../models");
const bcrypt = require("bcrypt");

const serialize = (data) => JSON.parse(JSON.stringify(data));

// Route for user signup
router.post('/signup', async (req, res) => {
    try {
      const user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });
  
      req.session.save(() => {
        req.session.loggedIn = true;
        req.session.user_id = user.id;
        res.redirect('/');
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !user.checkPassword(password)) {
      res.status(400).json({ message: "Incorrect email or password" });
      return;
    }

    req.session.save(() => {
      req.session.loggedIn = true;
      req.session.user_id = user.id;
      res.redirect("/");
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/logout", (req, res) => {
    if (req.session.loggedIn) {
      req.session.destroy(() => {
        res.redirect("/");
      });
    } else {
      res.redirect("/");
    }
  });




router.get("/dashboard", async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      res.redirect("/login");
      return;
    }

    const userPosts = await Post.findAll({ where: { user_id: req.session.user_id } });


    res.render("dashboard", { posts: userPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
