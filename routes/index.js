const express = require('express');
const router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require('passport');
const localStrategy = require("passport-local")
const upload = require("./multer")


passport.use(new localStrategy(userModel.authenticate()))

router.get('/', function (req, res) {
  res.render('index', { footer: false });
});

router.get('/login', function (req, res) {
  res.render('login', { footer: false });
});

router.get('/feed', isLoggedIn, async function (req, res) {
  const posts = await postModel.find().populate("user");
  res.render('feed', { footer: true, posts });
});

router.get('/profile', isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
    res.render('profile', { footer: true, user });
  } catch (err) {
    // Handle error appropriately, e.g., redirect to login with an error message
    res.redirect('/login');
  }
});

router.get('/search', isLoggedIn, function (req, res) {
  res.render('search', { footer: true });
});
router.get('/username/:username', isLoggedIn, async function (req, res) {
  const regex = new RegExp(`^${req.params.username}`, 'i');
  const users = await userModel.find({ username: regex });
  res.json(users);
});


router.get('/edit', isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    res.render('edit', { footer: true, user });
  } catch (err) {
    // Handle error appropriately, e.g., redirect to login with an error message
    res.redirect('/login');
  }
});

router.get('/upload', isLoggedIn, function (req, res) {
  res.render('upload', { footer: true });
});
router.post('/upload', isLoggedIn, upload.single("image"), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    pic: req.file.filename,
    user: user._id,
    caption: req.body.caption
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("/feed");
});

router.post("/update", upload.single("image"), isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOneAndUpdate(
      { username: req.session.passport.user },
      {
        username: req.body.username,
        name: req.body.name,
        bio: req.body.bio
      },
      { new: true }
    );
    if (req.file) {
      user.profileImage = req.file.filename;
    }
    await user.save();
    res.redirect("/profile");
  } catch (err) {
    // Handle error appropriately
    res.redirect('/profile');
  }
});

router.post("/register", function (req, res) {
  const userData = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  })
  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile")
      });
    })
})

router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile", // Corrected the spelling here
  failureRedirect: "/login",
}));

router.get('/logout', function (req, res, next) {
  req.logout(function(err) {
    if(err) {
      return next(err);
    }
    res.redirect('/');
  });
});


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login")
};

module.exports = router;
