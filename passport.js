const LocalStrategy = require('passport-local').Strategy;
const User = require('./user');
const bcrypt = require('bcrypt');


exports.initializePassport = (passport) => {
    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                const user = await User.findOne({ email: username });
                if (!user) {
                    return done(null, false);
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false);
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        })
    );

    passport.serializeUser((user, done) => {
        return done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        return done(null, user);
    });
}

exports.auth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}
exports.notAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect('/secrets');
    } else {
        next();
    }
}