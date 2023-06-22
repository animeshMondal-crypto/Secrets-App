require('dotenv').config();
const FacebookStrategy = require('passport-facebook');
const User = require('./user');

const initializeFacebook = (passport) => {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/facebook/secrets"
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log(profile);
                const user = await User.findOne({ facebookId: profile.id });
                if (!user) {
                    const user = new User({
                        facebookId: profile.id
                    });
                    user.save()
                        .then(() => {
                            console.log('user saved to db..');
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

module.exports = initializeFacebook;