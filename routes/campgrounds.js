/***** Imports *****/

// Express NPM Package
const express = require("express");

// Multer NPM Package
const multer = require("multer");

// catchAsync Function
const catchAsync = require("../utils/catchAsync");

// isLoggedIn, validateCampground, and isAuthor Middleware Functions
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");

// Create a new Router Object
const router = express.Router();

// Campground Controller
const campgrounds = require("../controllers/campgrounds");

// Get Cloudinary Storage
const { storage } = require("../cloudinary");

// Tell Multer to store image uploads to our Cloudinary Storage
const upload = multer({ storage });

/***** Routes *****/

// NOTE: you can instead of having individual routes, you can group routes together if they have the same path using router.route()
//       route.route(:path) takes in a path, and you can append the http methods/verbs/actions to it
//
// NOTE: upload.array(:image field from the form - the "name" attribute)
//       this gets all the uploaded image files! These filescan be accessed using "req.files"!
router.route("/")
    .get(catchAsync(campgrounds.index)) // All Campgrounds
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground)); // Add Campground to the Mongo Database

// Add Campground Form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground)) // Show Campground Details
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground)) // Update Campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); // Delete Campground

// Campground Edit Form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

/***** Export *****/

// Export the Campground Routes
module.exports = router;