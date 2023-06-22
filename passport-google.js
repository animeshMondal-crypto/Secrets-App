require('dotenv').config();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./user');

const initializeGoogle = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets"
    },
        async (accessToken, refreshToken, profile, done) => {
            //check user table for anyone with a facebook ID of profile.id
            try {
                // console.log(profile);
                const user = await User.findOne({ googleID: profile.id });
                if (!user) {
                    const user = new User({
                        googleID: profile.id
                    });
                    user.save()
                        .then(() => {
                            console.log('user saved to db');
                            return done(null, user);
                        })
                        .catch(err => console.log(err));

                } else {
                    return done(null, user);
                }
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        return done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        return done(null, user);
    });
}

module.exports = initializeGoogle;