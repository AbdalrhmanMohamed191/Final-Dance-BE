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
    username : {
        type : String,
        required : true
    },
    role : {
        type : String,
        enum : ["user" , "admin", "super-Admin"],
        default : "user"
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
    },

    resetPasswordToken : {
        type : String
    },
    resetPasswordExpire : {
        type : Date
    }
});

module.exports = mongoose.model("User", userSchema);