/***** Imports *****/

// Express NPM Package
const express = require("express");

// catchAsync Function
const catchAsync = require("../utils/catchAsync");

// Campground Model
const Campground = require("../models/campground");

// isLoggedIn, validateCampground, and isAuthor Middleware Functions
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");

// Create a new Router Object
const router = express.Router();

/***** GET Requests *****/

// All Campgrounds
router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds })
}));

// Add Campground Form
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// Campground Details
router.get("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;

    // This populates the author in each review, and separately populates the review and author in each campground
    const campground = await Campground.findById(id).populate({
        path: "reviews",
        populate: { path: "author" }
    }).populate("author");

    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}));

// Campground Edit Form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
}));

/***** POST Requests *****/

// Add Campground to the Mongo Database
router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);

    // RECALL: req.user is added by passport. It represents the logged in user
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
}));

/***** PUT Requests *****/

// Update Campground
router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true });
    req.flash("success", "Successfully updated campground");
    return res.redirect(`/campgrounds/${campground._id}`);
}));

/***** DELETE Requests *****/

// Delete Campground
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
}));

/***** Export *****/

// Export the Campground Routes
module.exports = router;