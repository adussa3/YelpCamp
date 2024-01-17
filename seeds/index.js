/****** Setting *****/

// process.env.NODE_ENV is an environment variable that is usually just "development" or "production"
// NOTE: prior to this, we've been running in development this whole time, but when we deploy this code,
//       it will be in production
//
// If we're running in development mode, then we're requiring the dotenv NPM Package which takes the variables
// defined in .env and add them into process.env in the node app
// 
// NOTE: we don't do this in production! There's another way we store environment variables where we don't store
// them in a file. Instead, we would add them into the environment
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

/***** Imports *****/

// Import Mongoose
const mongoose = require("mongoose");

// Import the Campground Model
const Campground = require("../models/campground");

// Import the Cities
const cities = require("./cities");

// Import the Descriptors and Places
const { descriptors, places } = require("./seedHelpers");

// Mapbox
const mapboxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

// Mapbox Public Token
const mapboxToken = process.env.MAPBOX_TOKEN;

// Mapbox Geocoding Instance
const geocoder = mapboxGeocoding({ accessToken: mapboxToken });

/***** Set up *****/

// Connect to a Mongo Database with Mongoose

// Local Database Link
// const dbUrl = "mongodb://localhost:27017/yelp-camp"

// Mongo Database Link
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Database connected"));

/***** Insert initial Campground seed data *****/

const getRandomElement = array => array[Math.floor(Math.random() * array.length)];

const generateCampground = async () => {
    const cityInfo = getRandomElement(cities);
    const descriptor = getRandomElement(descriptors);
    const place = getRandomElement(places);
    const price = Math.floor(Math.random() * 20) + 10;

    const campground = {
        author: "65a1d1d32e6b963207ddb531",
        title: `${descriptor} ${place}`,
        location: `${cityInfo.city}, ${cityInfo.state}`,
        geometry: {
            type: "Point",
            coordinates: [cityInfo.longitude, cityInfo.latitude]
        },
        images: [
            {
                url: "https://res.cloudinary.com/djkacdqvc/image/upload/v1704410793/YelpCamp/vt9n47z3u7hfkrolx4nb.jpg",
                filename: "YelpCamp/vt9n47z3u7hfkrolx4nb"
            },
            {
                url: "https://res.cloudinary.com/djkacdqvc/image/upload/v1704410793/YelpCamp/xe39vlhy81sxpicwfavr.jpg",
                filename: "YelpCamp/xe39vlhy81sxpicwfavr"
            }
        ],
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate dolor dicta reprehenderit, rem qui eligendi, repellendus voluptatem autem in similique vel perspiciatis culpa consequuntur aliquid, quae tempora quisquam maxime consectetur!",
        price
    }

    return campground;
}

const addCampgroundSeedData = async (numOfCamps = 400) => {
    // Delete the exisiting campgrounds in the Mongo Database
    await Campground.deleteMany({});

    // Create new campgrounds
    const campgroundsSet = new Set();
    const campgrounds = [];

    // Add a campground to the array if it doesn't match any other campgrounds
    while (campgroundsSet.size < numOfCamps) {
        const camp = await generateCampground();
        console.log();
        if (!campgroundsSet.has(JSON.stringify(camp))) {
            campgroundsSet.add(JSON.stringify(camp));
            campgrounds.push(camp);
        }
    }

    // Insert the campgrounds into the Mongo Database
    await Campground.insertMany(campgrounds)
        .then(data => {
            console.log("Added campground!");
            console.log(data);
        })
        .catch(error => {
            console.log("Error!");
            console.log(error);
        });
}

/***** Add Seed data to Mongo Database and close Mongoose connection ******/

addCampgroundSeedData()
    .then(data => {
        console.log("Seed data added! Closing Mongoose Connection");
        mongoose.connection.close();
    })
    .catch(error => {
        console.log("Error!");
        console.log(error);
    })