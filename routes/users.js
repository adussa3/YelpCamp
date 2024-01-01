/***** Imports *****/

// Express NPM Package
const express = require("express");
const passport = require("passport");

// User Model
const User = require("../models/user");

// Create a new Router Object
const router = express.Router();

// catchAsync Function
const catchAsync = require("../utils/catchAsync");

// storeReturnTo Middleware
const { storeReturnTo } = require("../middleware");

/***** GET Requests *****/

// Register a new account Form
router.get("/register", (req, res) => {
    res.render("users/register");
});

// Login Form
router.get("/login", (req, res) => {
    res.render("users/login");
});

/***** POST Requests *****/

// Add a new account to the Mongo Database
router.post("/register", catchAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);

        // req.login() and req.logout() are passport helper methods that is automatically added to the request object
        // req.login() establishes a login session (actually logs the user in when registered)
        req.login(registeredUser, err => {
            if (err) return next(err);

            // NOTE: req.login() does NOT return a promise so you cannot use the await keyword
            //       so req.flash and res.redirect need to be inside the callback function
            req.flash("success", "Welcome to Yelp Camp!");
            res.redirect("campgrounds");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
}));

// Log in User
//
// NOTE: the storeReturnTo middleware stores the returnTo value in res.locals.returnTo
//       we use this instead of req.session.returnTo because passport.authenticate() clears
//       session when the user successfully logs in, so req.session.returnTo can't be accessed
//
//       when a user tried to do something that requires you to log in their account, storeReturnTo
//       stores the url of the last page the user was on before they log in. After the user logs into
//       their account, they are returned back to the last page that they were on
//
// NOTE: passport.authenticate() is a middleware that authenticates a request
//       it takes in a stategy and check if the request follows the guidlines
//       options: (1) failureFlash - creates a flash message (2) failureRedirect - redirect to "/login" on a failure
router.post("/login", storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), (req, res) => {
    req.flash("success", "welcome back!");
    const redirectUrl = res.locals.returnTo || "campgrounds";
    res.redirect(redirectUrl);
});

// Logout
router.post("/logout", (req, res, next) => {
    // req.login() and req.logout() are passport helper methods that is automatically added to the request object
    // req.logout() terminates a login session
    req.logout(function (err) {
        if (err) return next(err);

        // NOTE: req.logout() does NOT return a promise so you cannot use the await keyword
        //       so req.flash and res.redirect need to be inside the callback function
        req.flash("success", "Goodbye!");
        res.redirect("/campgrounds");
    });
});

/***** Export *****/

// Export the User Routes
module.exports = router;