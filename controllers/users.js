/***** Imports *****/

// User Model
const User = require("../models/user");

/***** User Middleware Functions *****/

// Register a new account Form
module.exports.renderRegister = (req, res) => {
    res.render("users/register");
}

// Add a new account to the Mongo Database
module.exports.register = async (req, res, next) => {
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
}

// Login Form
module.exports.renderLogin = (req, res) => {
    res.render("users/login");
}

// Log in User
// NOTE: this isn't actually logging the user in
//       the actual login logic is beign handled by passport.authenticate()
module.exports.login = (req, res) => {
    req.flash("success", "welcome back!");
    const redirectUrl = res.locals.returnTo || "campgrounds";
    res.redirect(redirectUrl);
}

// Logout
module.exports.logout = (req, res, next) => {
    // req.login() and req.logout() are passport helper methods that is automatically added to the request object
    // req.logout() terminates a login session
    req.logout(function (err) {
        if (err) return next(err);

        // NOTE: req.logout() does NOT return a promise so you cannot use the await keyword
        //       so req.flash and res.redirect need to be inside the callback function
        req.flash("success", "Goodbye!");
        res.redirect("/campgrounds");
    });
}