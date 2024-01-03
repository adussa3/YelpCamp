/***** Imports *****/

// Express NPM Package
const express = require("express");
const passport = require("passport");

// Create a new Router Object
const router = express.Router();

// catchAsync Function
const catchAsync = require("../utils/catchAsync");

// storeReturnTo Middleware
const { storeReturnTo } = require("../middleware");

// User Controller
const users = require("../controllers/users");

/***** Routes *****/

// NOTE: you can instead of having individual routes, you can group routes together if they have the same path using router.route()
//       route.route(:path) takes in a path, and you can append the http methods/verbs/actions to it

router.route("/register")
    .get(users.renderRegister) // Register a new account Form
    .post(catchAsync(users.register)) // Add a new account to the Mongo Database

// Login Form
router.get("/login", users.renderLogin);

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
//       it takes in a stategy and check if the request follows the guidelines
//       options: (1) failureFlash - creates a flash message (2) failureRedirect - redirect to "/login" on a failure
router.post("/login", storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.login);

// Logout
router.post("/logout", users.logout);

/***** Export *****/

// Export the User Routes
module.exports = router;