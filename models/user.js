// Import the Mongoose NPM Package
const mongoose = require("mongoose");

// Set Schema to mongoose.Schema
const Schema = mongoose.Schema;

// Import the Passport Local Mongoose NPM Package
const passportLocalMongoose = require("passport-local-mongoose");

// Define User Schema
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// This adds the username, hashed password, and salt value fields to the schema
// It prevents duplicate usernames and provide additional static methods
// NOTE: passport-local-mongoose adds static methods like authenticate(),
//       serializeUser(), deserializeUser(), and register() which are called in app.js
userSchema.plugin(passportLocalMongoose)

// Create User Model
const User = mongoose.model("User", userSchema);

// Export User Model
module.exports = User;