/***** Imports *****/

// Express NPM Package
const express = require("express");

// ExpressError Class
const ExpressError = require("../utils/ExpressError");

// catchAsync Function
const catchAsync = require("../utils/catchAsync");

// Campground Model
const Campground = require("../models/campground");

// Campground Joi Schema
const { campgroundSchema } = require("../schemas");

// Create a new Router Object
const router = express.Router();

/***** VALIDATION *****/

// Validate the campground in the request
const validateCampground = (req, res, next) => {
    // Use the campground schema to validate the request body
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

/***** GET Requests *****/

// All Campgrounds
router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds })
}));

// Add Campground Form
router.get("/new", (req, res) => {
    res.render("campgrounds/new");
});

// Campground Details
router.get("/:id", catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id).populate("reviews");
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}));

// Campground Edit Form
router.get("/:id/edit", catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
}));

/***** POST Requests *****/

// Add Campground to Mongo Database
router.post("/", validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
}));

/***** PUT Requests *****/

// Update Campground
router.put("/:id", validateCampground, catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true });
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${campground._id}`);
}));

/***** DELETE Requests *****/

// Delete Campground
router.delete("/:id", catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
}));

/***** Export *****/

// Export the Campground Routes
module.exports = router;