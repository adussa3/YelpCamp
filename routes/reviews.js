/***** Imports *****/

// Express NPM Package
const express = require("express");

// ExpressError Class
const ExpressError = require("../utils/ExpressError");

// catchAsync Function
const catchAsync = require("../utils/catchAsync");

// Campground Model
const Campground = require("../models/campground");

// Review Model
const Review = require("../models/review");

// Review Joi Schema
const { reviewSchema } = require("../schemas");

// Create a new Router Object
// NOTE: Express Router likes to keep :id seperate so it doesn't get passed into reviews.js
//       However, we can specifiy this option { mergeParams: true }
//       This merges the params in app.js with the params in reviews.js
const router = express.Router({ mergeParams: true });

/***** VALIDATION *****/

// Validate the review in the request
const validateReview = (req, res, next) => {
    // Use the review schema to validate the request body
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

/***** POST Requests *****/

// Add a review to the Campground
router.post("/", validateReview, catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    req.flash("success", "Created new review");
    res.redirect(`/campgrounds/${campground._id}`);
}));

/***** DELETE Requests *****/

// Delete the selected Review from its associated Campground
router.delete("/:reviewId", catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // $pull pulls out the review using the reviewId from the campground's reviews array
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${campground._id}`);
}));

/***** Export *****/

// Export the Review Routes
module.exports = router;