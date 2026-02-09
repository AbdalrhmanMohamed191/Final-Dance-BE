// IMPORTS
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// intrnal imports
const { connectDB } = require("./config/dbConfig");
const authRoutes = require("./routes/authRoutes");
const { default: rateLimit } = require("express-rate-limit");
const bookRoutes = require("./routes/bookRoutes");
const upload = require("./uploads/uploads");
const userRoutes = require("./routes/userProfile");

dotenv.config();

// APP
const app = express();


// MIDDLEWARES
app.use(express.json());
app.use(cors({ origin: JSON.parse(process.env.PRODUCTION_ENV) ? process.env.CLIENT_ORIGIN : "*" }));

app.use('/public', express.static(path.join(__dirname , "public")));
console.log("public", path.join(__dirname, "public"));

 // serve static files from the "public" directory
app.use('/uploads', express.static(path.join(__dirname, "uploads"))); 


// RATE LIMITER
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100 // limit each IP to 100 requests per windowMs
}));
// GLOBAL PORT
const PORT = process.env.PORT || 3000
// MAIN ROUTES
app.get("/", (req, res) => {
    res.send("Welcome to the server API");
});
app.post("/upload", upload.single("file"), (req, res) => {
    res.json({ file: req.file });
});

// API ROUTES
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/book", bookRoutes); 
app.use("/api/v1/user", userRoutes);


connectDB();


// LISTENER 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});