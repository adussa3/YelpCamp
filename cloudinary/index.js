// Require the Cloudinary Library
const cloudinary = require("cloudinary").v2;

// Require Cloudinary Storage
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Setting the config on our Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

// Instantiate an instance of CloudinaryStorage
// we pass in an object with Cloudinary (connects to our storage),
// the folder in cloudinary where we should store things in,
// allowedFormats tells us the type of files the storage allows
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "YelpCamp",
        allowedFormats: ["jpeg", "png", "jpg"]
    }
});

// Export both our configured Cloudinary instance and Storage
module.exports = {
    cloudinary,
    storage
}