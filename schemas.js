// Import Joi NPM Package
const BaseJoi = require("joi");

// Import Sanitiza-HTML NPM Package
const sanitizeHtml = require("sanitize-html");

// This function sanitizes the Joi schema inputs to prevent Cross Site Scripting
const extension = (joi) => ({
    type: "string",
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not include HTML!"
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [], // you can add allowed HTML tags inside this array
                    allowedAttributes: {}
                });
                if (clean !== value) return helpers.error("string.escapeHTML", { value });
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

// Create Campground Schema
// This schema defines what campground properties are required and how they should be defined
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().precision(2).required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

// Create Review Schema
// This schema defines what review properties are required and how they should be defined
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});