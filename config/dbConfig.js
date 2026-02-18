// // IMPORTS
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// // CONFIG
// dotenv.config();
// // CONNECTION TO MONGODB
// async function connectDB() {
//     try {
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log("Connected to MongoDB");
//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//     }
// }

// module.exports = {connectDB};


const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

module.exports = { connectDB };
