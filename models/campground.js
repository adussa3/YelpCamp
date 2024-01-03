// Import the Mongoose NPM Package
const mongoose = require("mongoose");

// The Schema variable is just a shortcut
// We can use Schema, instead of fully typing out mongoose.Schema
const Schema = mongoose.Schema;

// Import the Review Model
const Review = require("./review");

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
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

// Deletes all the associated reviews when a Campground is deleted
// NOTE: This get executed when Campground.findByIdAndDelete(id) is called in app.js
campgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
});

// Create the Campground Model
const Campground = new mongoose.model("Campground", campgroundSchema);

// Export the Campground Model
module.exports = Campground;