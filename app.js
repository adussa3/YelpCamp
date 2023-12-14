/***** Imports *****/

// NPM Packages
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const methodOverride = require("method-override");

// Campground Model
const Campground = require("./models/campground");

/***** Set up *****/

// Create Express application
const app = express();

// Connect to a Mongo Database with Mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp")

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Database connected"));

// Set EJS Engine
app.engine("ejs", engine);

// Set View Engine to EJS Mate instead of the default EJS
app.set("view engine", "ejs");

// Set an absolute path to the views directory
app.set("views", path.join(__dirname, "views"));

// Use application/x-www-form-urlencoded to parse POST requests
app.use(express.urlencoded({ extended: true }));

// Override POST requests with what "_method=..." is set to (PUT, PATCH, DELETE)
app.use(methodOverride("_method"));

/***** Routing *****/

//// GET Requests

// Home
app.get("/", (req, res) => {
    res.render("home");
});

// All Campgrounds
app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds })
});

// Add Campground Form
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

// Campground Details
app.get("/campgrounds/:id", async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    res.render("campgrounds/show", { campground });
});

// Campground Edit Form
app.get("/campgrounds/:id/edit", async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", { campground });
});

///// POST Requests

// Add Campground to Mongo Database
app.post("/campgrounds", async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});

//// PUT Requests

// Update Campground
app.put("/campgrounds/:id", async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true });
    res.redirect(`/campgrounds/${campground._id}`);
});

//// DELETE Requests

// Delete Campground
app.delete("/campgrounds/:id", async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
});

/***** Express Connection *****/

// Bind and listen to the connections on the specified host and port
const port = 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});