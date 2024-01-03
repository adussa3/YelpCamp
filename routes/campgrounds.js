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

// Campground Controller
const campgrounds = require("../controllers/campgrounds");

/***** Routes *****/

// NOTE: you can instead of having individual routes, you can group routes together if they have the same path using router.route()
//       route.route(:path) takes in a path, and you can append the http methods/verbs/actions to it

router.route("/")
    .get(catchAsync(campgrounds.index)) // All Campgrounds
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground)); // Add Campground to the Mongo Database

// Add Campground Form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground)) // Show Campground Details
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground)) // Update Campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); // Delete Campground

// Campground Edit Form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

/***** Export *****/

// Export the Campground Routes
module.exports = router;