// Import Mongoose NPM Package
const mongoose = require("mongoose");

// Set Schema to mongoose.Schema
const Schema = mongoose.Schema;

// Define Review Schema
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

// Create Review Model
const Review = mongoose.model("Review", reviewSchema);

// Export Review Model
module.exports = Review