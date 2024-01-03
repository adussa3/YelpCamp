/***** Imports *****/

// Campground Model
const Campground = require("../models/campground");

/***** Campground Middleware Functions *****/

// All Campgrounds
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

// Add Campground Form
module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

// Create Campground
module.exports.createCampground = async (req, res) => {
    const campground = new Campground(req.body.campground);

    // RECALL: req.user is added by passport. It represents the logged in user
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
}

// Show Campground Details
module.exports.showCampground = async (req, res) => {
    const { id } = req.params;

    // This populates the author in each review, and separately populates the review and author in each campground
    const campground = await Campground.findById(id).populate({
        path: "reviews",
        populate: { path: "author" }
    }).populate("author");

    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }

    res.render("campgrounds/show", { campground });
}

// Campground Edit Form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
}

// Update Campground
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true });
    req.flash("success", "Successfully updated campground");
    return res.redirect(`/campgrounds/${campground._id}`);
}

// Delete Campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
}