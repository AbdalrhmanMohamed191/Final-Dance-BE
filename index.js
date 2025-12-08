const expreass = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = expreass();

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
    res.send("Welcome to the server API");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});