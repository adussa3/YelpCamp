/***** Imports *****/

// Express NPM Package
const express = require("express");

// catchAsync Function
const catchAsync = require("../utils/catchAsync");

// Review Controller
const reviews = require("../controllers/reviews");

// isLoggedIn, validateReview, and isReviewAuthor Middleware Functions
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware");

// Create a new Router Object
// NOTE: Express Router likes to keep :id seperate so it doesn't get passed into reviews.js
//       However, we can specifiy this option { mergeParams: true }
//       This merges the params in app.js with the params in reviews.js
const router = express.Router({ mergeParams: true });

/***** Routes *****/

// Add a Review to the Campground
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Delete the selected Review from its associated Campground
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

/***** Export *****/

// Export the Review Routes
module.exports = router;