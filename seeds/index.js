/***** Imports *****/

// Import Mongoose
const mongoose = require("mongoose");

// Import the Campground Model
const Campground = require("../models/campground");

// Import the Cities
const cities = require("./cities");

// Import the Descriptors and Places
const { descriptors, places } = require("./seedHelpers");

/***** Set up *****/

// Connect to a Mongo Database with Mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp")

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Database connected"))

/***** Insert initial Campground seed data *****/

const getRandomElement = array => array[Math.floor(Math.random() * array.length)];

const generateCampground = () => {
    const city = getRandomElement(cities);
    const descriptor = getRandomElement(descriptors);
    const place = getRandomElement(places);
    const price = Math.floor(Math.random() * 20) + 10;

    const campground = {
        author: "65934d4416aefc5d7754a57e",
        title: `${descriptor} ${place}`,
        location: `${city.city}, ${city.state}`,
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

const addCampgroundSeedData = async (numOfCamps = 100) => {
    // Delete the exisiting campgrounds in the Mongo Database
    await Campground.deleteMany({});

    // Create new campgrounds
    const campgroundsSet = new Set();
    const campgrounds = [];

    while (campgroundsSet.size < numOfCamps) {
        const camp = generateCampground();
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