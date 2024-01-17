/****** Setting *****/

// process.env.NODE_ENV is an environment variable that is usually just "development" or "production"
// NOTE: prior to this, we've been running in development this whole time, but when we deploy this code,
//       it will be in production
//
// If we're running in development mode, then we're requiring the dotenv NPM Package which takes the variables
// defined in .env and add them into process.env in the node app
// 
// NOTE: we don't do this in production! There's another way we store environment variables where we don't store
// them in a file. Instead, we would add them into the environment
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

/***** Imports *****/

// NPM Packages
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStategy = require("passport-local");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const MongoStore = require("connect-mongo");

// ExpressError Class
const ExpressError = require("./utils/ExpressError");

// Campground Routes
const campgroundRoutes = require("./routes/campgrounds");

// Review Routes
const reviewRoutes = require("./routes/reviews");

// User Routes
const userRoutes = require("./routes/users");

// User Model
const User = require("./models/user");

/***** Set up *****/

// Create Express application
const app = express();

// Connect to a Mongo Database with Mongoose

// Local Database Link
// const dbUrl = "mongodb://localhost:27017/yelp-camp"

// Mongo Database Link
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl);

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

// THIS PREVENTS MongoDB Operator Injection
//
// IMPORTANT: mongoSanitize searches for any keys in objects that begin with a $ sign or contain a .,
//            from req.body, req.query or req.params.
//
// Object keys starting with a $ or containing a . are reserved for use by MongoDB as operators.
// Without this sanitization, malicious users could send an object containing a $ operator,
// or including a ., which could change the context of a database operation. Most notorious is 
// the $where operator, which can execute arbitrary JavaScript on the database.
//
// The best way to prevent this is to sanitize the received data, and remove any offending keys,
// or replace the characters with a 'safe' one.
app.use(mongoSanitize());

// By default, the storage location for  express-session is the memory store
// the memory store manages things in memory, which can be problematic because
// it doesn't scale well, it can't hold very much information, and it's non-performant
// it's ok for testing/in the development environment, but it should NOT be used in the 
// production environment
//
// Instead, we'll store express-session information in mongo!
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: process.env.SECRET,
    touchAfter: 24 * 60 * 60 // we don't want to resave all the session on the database every single time the user refreshes the page,
});                          // we can lazy update the session, by limiting a period of time the session is updated after 24 hours elapsed (in seconds)

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

// Define Session Options
const sessionConfig = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        // we can change the default name of our session (the default name is connect.sid)
        // this adds an extra layer of security! People can write a script to grab the session ID
        // from the browser and steal the session information and login
        name: "session",

        // the session cookie expires after 1 week (in terms of milliseconds)
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000),

        // the maximum age a cookie can be is 1 week (in terms of milliseconds)
        maxAge: 7 * 24 * 60 * 60 * 1000,

        // this prevents the cookie from being accessed by client-side scripts
        // the browser will not reveal the cookie to a third party (extra security)
        // in other words, it's not accessible by JavaScript
        // NOTE: by default, it's automatically set to true
        httpOnly: true,

        // setting secure to true breaks things in our localhost!
        // basically, it says that this cookie should only work over HTTPS connections (NOT HTTP)
        // we do want to set this to true when we deploy the app on a secure web host, so the
        // cookies can only be configured over secure (HTTPS) connections
        // 
        // When true, the Secure attribute is set, otherwise it is not.
        // By default, the Secure attribute is not set.
        //
        // Note be careful when setting this to true, as compliant clients will not send the cookie back
        // to the server in the future if the browser does not have an HTTPS connection.
        //secure: true
    }
}

// Use session() for every HTTP Request
app.use(session(sessionConfig));

// Enable flash messages
app.use(flash());

// Enable all 11 of Helmet's Middlwares
// NOTE: The Content-Security-Policy (CSP) header mitigates a large number of attacks, such as cross-site scripting.
// CSP is an extra layer of security that allows us to specify/restrict the locations we get our resources from
// Basically we can specify a list of acceptable sources. We're designating our own policy and defining what's allowed and what's not allowed
// Link: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy#directives
//
// ex) When CSP is enabled, we can say:
// (1) we're only allowed get images from unsplash
// (2) we're only allowed to run scripts that come from only "this website"
// (3) we're only allowed to get and request fonts from Google Fonts
app.use(helmet());

// we're restriciting the locations where we can get our resources from
// if omeone tries to inject something, and there's a request going off to some other url that we didn't
// define in helmet, then it gets blocked/is not allowed by the browser
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/djkacdqvc/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Initialize Passport
app.use(passport.initialize());

// Enable Persistent Login Sessions
// NOTE: app.use(session(...)) should occur BEFORE this! 
app.use(passport.session());

// Passport uses the LocalStategy
// The LocalStategy uses the authentication method in the User model
passport.use(new LocalStategy(User.authenticate()));

// This tells passport how to serialize a user
// Serialization refers to how to store a user in a session
passport.serializeUser(User.serializeUser());

// This tells passport how to deserialize a user
// Deserialize refers to how to get a user (unstore) out of a session
passport.deserializeUser(User.deserializeUser());

// Update res.locals
app.use((req, res, next) => {
    // console.log(req.session);

    // res.locals are global and can be accessed by all views template

    // NOTE: req.user is an object that contains information of the logged in user (or undefined if signed out)
    //       we don't have to look in the session to get the user, we can directly call it from request
    //
    //       res.user is added by passport, and it is automatically filled in with the deserialized information from the session
    //       so the session stores the serialized information and passport deserializes the session and fill in req.user with that data
    res.locals.currentUser = req.user;
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

// User Express Router
app.use("/", userRoutes);

/***** Error Handling *****/

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