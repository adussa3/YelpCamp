/***** Imports *****/

// Campground Model
const Campground = require("../models/campground");

// Cloudinary
const { cloudinary } = require("../cloudinary");

// Mapbox
const mapboxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

// Mapbox Public Token
const mapboxToken = process.env.MAPBOX_TOKEN;

// Mapbox Geocoding Instance
const geocoder = mapboxGeocoding({ accessToken: mapboxToken });

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

    // campground.geometry stores the longitude and latitude and coordinate points
    // NOTE: this a Mapbox function that give us a list of possible locations
    // and their data based on the campground's location
    const geoData = await geocoder.forwardGeocode({
        query: campground.location, // we input the campground's location
        limit: 1 // we limit the output to 1 result
    }).send();

    // we set the campground's geometry to the 1 result from geoData
    campground.geometry = geoData.body.features[0].geometry;

    // RECALL: req.user is added by passport. It represents the logged in user
    campground.author = req.user._id;

    // req.files is now populated with information from Cloudinary!
    // we can get the images URLs from our Cloudinary storage and save them to our campground
    campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));

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

    // Concatenate the new image files into the exisiting campgrounds images
    const newImages = req.files.map(file => ({ url: file.path, filename: file.filename }));
    campground.images.push(...newImages);
    await campground.save();

    if (req.body.deleteImages) {
        // Delete images from Cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }

        // Delete the checked images - deletes all the images whose filename matches with the
        // checked images' filename in the deleteImages array
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
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