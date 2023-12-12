// Import the Mongoose NPM Package
const mongoose = require("mongoose");

// The Schema variable is just a shortcut
// We can use Schema, instead of fully typing out mongoose.Schema
const Schema = mongoose.Schema;

// Create the Campground Schema
const campgroundSchema = new Schema({
    title: {
        type: String,
        //required: true
    },
    price: {
        type: Number,
        //required: true,
        min: 0
    },
    description: {
        type: String,
        //required: true
    },
    location: {
        type: String,
        //required: true
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