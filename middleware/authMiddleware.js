// IMPORTS
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// CONFIG
dotenv.config();


function authMiddleware (request , response , next) {
    try {
        // CHECK IF USER IS AUTHENTICATED
        const auth = request.headers[authorization];
        if (!auth) {
            return response.status(401).json({message : "Unauthorized"});
        }

        // CHECK IF TOKEN IS VALID
        const token = auth.split(" ")[1];
        if (!token) {
            return response.status(401).json({message : "Unauthorized"});
        }

        // VERIFY TOKEN
        const decodedToken = jwt.verify(token , process.env.JWT_SECRET);
        request.user = decodedToken;
        next();
    } catch (error) {
        console.log(error)
        return response.status(401).json({message : "Unauthorized"});

    }

}

module.exports = {authMiddleware};