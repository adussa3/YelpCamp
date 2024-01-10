// Import the Mongoose NPM Package
const mongoose = require("mongoose");

// The Schema variable is just a shortcut
// We can use Schema, instead of fully typing out mongoose.Schema
const Schema = mongoose.Schema;

// Import the Review Model
const Review = require("./review");


// we need a imageSchema to access each INDIVIDUAL image to apply the virtual property to
// every image has a url and filename
const imageSchema = new Schema({
    url: String,
    filename: String
});

imageSchema.virtual("thumbnail").get(function () {
    // the 'this' keyword refers to the individual image
    // link: https://cloudinary.com/documentation/transformation_reference
    return this.url.replace("/upload", "/upload/w_200,h_100,c_fill");
});

imageSchema.virtual("carousel").get(function () {
    // the 'this' keyword refers to the individual image
    // link: https://cloudinary.com/documentation/transformation_reference
    return this.url.replace("/upload", "/upload/h_500,c_fill");
});

// Create the Campground Schema
const campgroundSchema = new Schema({
    title: {
        type: String
    },
    images: [imageSchema],
    // MongoDB supports GeoJSON functionality
    // You need to use this GeoJSON pattern
    // Mapbox also works with GeoJSON which allows them to work together without to convert between each other
    //
    // NOTE: originally this was set to "required", but it's possible for the user to set a location that cannot
    // be geocoded by mapbox!
    //
    // NOTE: By default, Mongoose does not include virtuals when you convert a document to JSON.
    //       For example, if you pass a document to Express' res.json() function, virtuals will 
    //       not be included by default.
    //
    //       To include virtuals in res.json(), you need to set the toJSON schema option to { virtuals: true }.
    geometry: {
        type: {
            type: String,
            enum: ["Point"]
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: {
        type: Number,
        min: 0
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, { toJSON: { virtuals: true } });

imageSchema.virtual("carousel").get(function () {
    // the 'this' keyword refers to the individual image
    // link: https://cloudinary.com/documentation/transformation_reference
    return this.url.replace("/upload", "/upload/h_500,c_fill");
});

// We're nesting popUpMarkup in properties!
// We can access this value by calling campground.properties.popUpMarkup
campgroundSchema.virtual("properties.popUpMarkup").get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`;
});

// Deletes all the associated reviews when a Campground is deleted
// NOTE: This get executed when Campground.findByIdAndDelete(id) is called in app.js
campgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
});

// Create the Campground Model
const Campground = new mongoose.model("Campground", campgroundSchema);

// Export the Campground Model
module.exports = Campground;