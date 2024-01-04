/***** Imports ******/

// ExpressError Class
const ExpressError = require("./utils/ExpressError");

// Campground and Review Joi Schemas
const { campgroundSchema, reviewSchema } = require("./schemas");

// Campground Model
const Campground = require("./models/campground");

// Review Model
const Review = require("./models/review");

/***** Authentication & Authorization Middleware Functions *****/

// NOTE: req.isAuthenticated() is a passport helper method that is automatically added to the request object
//       it uses the session from serialize and deserialize user (executed in app.js)
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // store the URL from the request in the session
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be sign in first!");
        return res.redirect("/login");
    }
    next();
}

// This middleware saves the returnTo value from the session to res.locals
// this is because res.locals.returnTo can be accessed globally
module.exports.storeReturnTo = (req, res, next) => {
    // NOTE: when you try to delete a review as a guest, res.session.returnTo is set to: /campgrounds/:id/reviews/:reviewId?_method=DELETE
    //       when the user logs in and are redirected to this Url, they encounter a "Page Not Found" error!
    //       so we're update the Url to remove the "/review" parameter to make it a valid Url
    if (req.session.returnTo) {
        const endIndex = req.session.returnTo.indexOf("/reviews");
        if (endIndex !== -1) {
            res.locals.returnTo = req.session.returnTo.substring(0, endIndex);
        } else {
            res.locals.returnTo = req.session.returnTo;
        }
    }
    next();
}

// Verify that changes made to the campground is done by the user who create it
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    // Authorization
    // RECALL: req.user is added by passport. It's the logged in user
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }

    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    // Authorization
    // RECALL: req.user is added by passport. It's the logged in user
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }

    next();
}

/***** Campground Middleware Functions *****/

// Validate the campground in the request
module.exports.validateCampground = (req, res, next) => {
    // Use the campground schema to validate the request body
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

/***** Review Middleware Functions *****/

// Validate the review in the request
module.exports.validateReview = (req, res, next) => {
    // Show an client-side error flash message if review.rating is set to 0
    const { review } = req.body;
    if (review.rating == 0) {
        const { id } = req.params;
        req.flash("error", "Please select a star rating");
        return res.redirect(`/campgrounds/${id}`);
    }

    // Use the review schema to validate the request body
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}