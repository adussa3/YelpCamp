/***** Imports *****/

// NPM Packages
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const methodOverride = require("method-override");

// Campground Model
const Campground = require("./models/campground");

// catchAsync Function
const catchAsync = require("./utils/catchAsync");

// ExpressError Class
const ExpressError = require("./utils/ExpressError");

// campgroundSchema
const { campgroundSchema } = require("./schemas");

/***** Set up *****/

// Create Express application
const app = express();

// Connect to a Mongo Database with Mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp")

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Database connected"));

// Set the EJS Engine to EJS MATE instead of the default EJS
app.engine("ejs", engine);

// Set View Engine to EJS
app.set("view engine", "ejs");

// Set an absolute path to the views directory
app.set("views", path.join(__dirname, "views"));

// Use application/x-www-form-urlencoded to parse POST requests
app.use(express.urlencoded({ extended: true }));

// Override POST requests with what "_method=..." is set to (PUT, PATCH, DELETE)
app.use(methodOverride("_method"));

/***** Routing *****/

//// VALIDATION ////

// Validate the campground in request
const validateCampground = (req, res, next) => {
    // Use the schema to validate the request body
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

//// GET Requests ////

// Home
app.get("/", (req, res) => {
    res.render("home");
});

// All Campgrounds
app.get("/campgrounds", catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds })
}));

// Add Campground Form
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

// Campground Details
app.get("/campgrounds/:id", catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    res.render("campgrounds/show", { campground });
}));

// Campground Edit Form
app.get("/campgrounds/:id/edit", catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", { campground });
}));

///// POST Requests ////

// Add Campground to Mongo Database
app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

//// PUT Requests ////

// Update Campground
app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true });
    res.redirect(`/campgrounds/${campground._id}`);
}));

//// DELETE ////

// Delete Campground
app.delete("/campgrounds/:id", catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));

//// Error Handling Middleware ////

// Link https://stackoverflow.com/questions/14125997/difference-between-app-all-and-app-use
// app.all() attaches to the application's router
// app.use() attaches to the application's main middleware stack
//
// if we reach app.all(), it throws an error which
// will then be sent to the error handling middleware
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
})

// Error Handling Middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render("error", { err });
});

/***** Express Connection *****/

// Bind and listen to the connections on the specified host and port
const port = 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});