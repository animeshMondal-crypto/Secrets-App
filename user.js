const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleID: String,
    facebookId: String,
    secret: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;