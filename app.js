/***** Imports *****/

// NPM Packages
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");

// ExpressError Class
const ExpressError = require("./utils/ExpressError");

// Campground Routes
const campgroundRoutes = require("./routes/campgrounds");

// Review Routes
const reviewRoutes = require("./routes/reviews");

/***** Set up *****/

// Create Express application
const app = express();

// Connect to a Mongo Database with Mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp");

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

// Serving Static Files - set absolute path to the public directory
app.use(express.static(path.join(__dirname, "public")));

// Define Session Options
const sessionConfig = {
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        // the session cookie expires after 1 week (in terms of milliseconds)
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000),

        // the maximum age a cookie can be is 1 week (in terms of milliseconds)
        maxAge: 7 * 24 * 60 * 60 * 1000,

        // this prevents the cookie from being accessed by client-side scripts
        // the browser will not reveal the cookie to a third party (extra security)
        // NOTE: by default, it's automatically set to true
        httpOnly: true
    }
}

// Use session() for every HTTP Request
app.use(session(sessionConfig));

// Enable flash messages
app.use(flash());

// Update res.locals
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

/***** Routing *****/

// Home
app.get("/", (req, res) => {
    res.render("home");
});

// Campground Express Router
app.use("/campgrounds", campgroundRoutes);

// Review Express Router
app.use("/campgrounds/:id/reviews", reviewRoutes);

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