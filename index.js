// IMPORTS
const expreass = require("express");
const dotenv = require("dotenv");
const { connectDB } = require("./config/dbConfig");
// GLOBAL CONFIG
dotenv.config();

const app = expreass();
// GLOBAL PORT
const PORT = process.env.PORT || 3000
// ROUTES
app.get("/", (req, res) => {
    res.send("Welcome to the server API");
});

connectDB();


// LISTENER 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});