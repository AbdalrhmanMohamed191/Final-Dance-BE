const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },

    otp : {
        type : String,
        maxlength : 6
    },
    otpExpired : {
        type : Date
    },
    isVerfied : {
        type : Boolean,
        default : false
    }
});

module.exports = mongoose.model("User", userSchema);