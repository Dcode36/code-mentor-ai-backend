const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },  // Clerk ID
    userObject: { type: Object, required: true }             // Full Clerk user object snapshot
});

module.exports = mongoose.model('User', userSchema);
