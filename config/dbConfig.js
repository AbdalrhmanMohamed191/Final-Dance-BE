// IMPORTS
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// CONFIG
dotenv.config();
// CONNECTION TO MONGODB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

module.exports = {connectDB};