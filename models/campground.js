// Import the Mongoose NPM Package
const mongoose = require("mongoose");

// The Schema variable is just a shortcut
// We can use Schema, instead of fully typing out mongoose.Schema
const Schema = mongoose.Schema;

// Create the Campground Schema
const campgroundSchema = new Schema({
    title: {
        type: String
    },
    image: {
        type: String
    },
    price: {
        type: Number,
        min: 0
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    }
});

// Create the Campground Model
const Campground = new mongoose.model("Campground", campgroundSchema);

// Export the Campground Model
module.exports = Campground;