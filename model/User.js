const mongoose = require("mongoose");
const path = require("path");


const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : function() {
            return !this.isGoogleUser;
        } 
    },
    isGoogleUser : {
        type : Boolean,
        default : false
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
    },

    // profile Info
    username : {
        type : String,
        required : true
    },
   profileImage: {
  type: String,
  default: path.join("public", "default-profile.png") // Default profile image path,


},
    bio : {
        type : String,
        maxlength : 250
    },

    followers : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    following : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ]




}, {timestamps : true});

// module.exports = mongoose.model("User", userSchema);
module.exports = mongoose.models.User || mongoose.model("User", userSchema);


