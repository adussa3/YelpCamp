// Import Joi NPM Package
const Joi = require("joi");

// Create Campground Schema
// This schema defines what campground properties are required and how they should be defined
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().precision(2).required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});

// Create Review Schema
// This schema defines what review properties are required and how they should be defined
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});