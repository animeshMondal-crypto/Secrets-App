require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt'); //! bcrypt
const saltRounds = 10;
const User = require('./user');
const { initializePassport, auth, notAuth } = require('./passport');
const initializeGoogle = require('./passport-google');
const initializeFacebook = require('./passport-facebook');
// const md5 = require('md5'); //! Hash Function
// const encrypt = require('mongoose-encryption');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));


initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

initializeGoogle(passport);
initializeFacebook(passport);

mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true });

//!Encryption using key
// const secret = 'Loremipsumdolorsitamet,consecteturadipiscingelit,seddoeiusmodtemporincididuntutlaboreetdoloremagnaaliqua.'
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });


app.get('/', notAuth, (req, res) => {
    res.render('home', { title: 'Home' });
});

//! Google Auth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // Successful authentication, redirect protected page.
    res.redirect('/secrets');
});

//! Facebook Auth
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/secrets', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/secrets');
});

app.get('/login', notAuth, (req, res) => {
    res.render('login', { title: 'Login' });
});

app.get('/register', notAuth, (req, res) => {
    res.render('register', { title: 'Register' });
});

app.get('/secrets', async (req, res) => {
    try {
        const foundUsers = await User.find({ secret: { $ne: null } });
        if (foundUsers) {
            res.render('secrets', { title: '🤯🤯🤯', userSecrets: foundUsers });
        }
    } catch (error) {
        console.log(error);
    }
});

app.get('/submit', auth, (req, res) => {
    res.render('submit', { title: 'Submit' });
})

app.post('/submit', async (req, res) => {
    try {
        const userSecret = req.body.secret;
        const foundUser = await User.findById(req.user.id);
        if (foundUser) {
            foundUser.secret = userSecret;
            foundUser.save()
                .then(() => {
                    res.redirect('/secrets');
                });
        }
    } catch (error) {
        console.log(error);
    }
});

app.get('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
})

app.post('/register', async (req, res) => {
    try {
        bcrypt.hash(req.body.password, saltRounds)
            .then((hash) => {
                const newUser = new User({
                    email: req.body.username,
                    password: hash
                });
                newUser.save()
                    .then(() => {
                        res.redirect('/login');
                    })
                    .catch((err) => {
                        res.send(err);
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    } catch (err) {
        console.log(err);
    }
});

//! local auth
app.post('/login', passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/secrets' }));

app.listen(3000, () => {
    console.log('server running on port 3000');
})