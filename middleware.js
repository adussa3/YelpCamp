// NOTE: req.isAuthenticated() is a passport helper method that is automatically added to the request object
//       it uses the session from serialize and deserialize user (executed in app.js)
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // store the URL from the request in the session
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be sign in first!");
        return res.redirect("/login");
    }
    next();
}

// This middleware saves the returnTo value from the session to res.locals
// this is because res.locals.returnTo can be accessed globally
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) res.locals.returnTo = req.session.returnTo;
    next();
}