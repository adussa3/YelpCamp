/***** Imports *****/

// Campground Model
const Campground = require("../models/campground");

// Review Model
const Review = require("../models/review");

/***** Review Middleware Functions *****/

// Add a review to the Campground
module.exports.createReview = async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    req.flash("success", "Created new review");
    res.redirect(`/campgrounds/${campground._id}`);
}

// Delete the selected Review from its associated Campground
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // $pull pulls out the review using the reviewId from the campground's reviews array
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${campground._id}`);
}