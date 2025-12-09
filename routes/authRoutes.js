// IMPORTS
const express = require('express');
const crypto = require("crypto");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// CONFIG
dotenv.config();

// IMPORT VALIDATORS
const { registerSchema, verifySchema, loginSchema, resendOtpSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validation/userValidator');
// const { generate } = require('otp-generator');
const User = require("../model/user");
const { sendEmail } = require('../utils/sendEmail');
const { generateOtp } = require('../utils/generateOtp');
const { authMiddleware } = require('../middleware/authMiddleware');


// TODO REGISTER USER
router.post("/register", async (req, res) => {
    try {
        // VALIDATION
        const {error , value } = registerSchema.validate(req.body , {abortEarly : false});
        if (error) {
            return res.status(400).json({message : error.map((err) => err.message)});
        }

        const {email , password} = value;

        // CHECK IF USER EXISTS
        const userExists = await User.findOne({email : value.email});
        if (userExists) {
            return res.status(400).json({message : "User already exists"});
        }

        // Hash Password
        const HashedPassword = await bcrypt.hash(password , 12);

        // Generate OTP
         const {otp , otpExpired} =  generateOtp();

        // CREATE USER
        const user = await User.create({
            email,
            password : HashedPassword,
            otp,
            otpExpired
        });

         // SEND EMAIL
        await sendEmail(email , "Verify your email" , `Your OTP is ${otp}`);

        res.status(201).json({message : "OTP sent to your email"});

        
    } catch (error) {
        console.log(error)
        res.status(500).json({message : "Internal Server Error"})
    }
});
// TODO LOGIN USER
router.post("/login", async (req, res) => {
     try {
        // VALIDATION
        const {error , value} = loginSchema.validate(req.body , {abortEarly : false});
        if (error) {
            return res.status(400).json({message : error.map((err) => err.message)});
        }

        const {email , password} = value;

        // CHECK IF USER EXISTS
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message : "INVALID EMAIL OR PASSWORD"});
        }
         
        // CHECK IF PASSWORD IS CORRECT
        const isPasswordCorrect = await bcrypt.compare(password , user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({message : "INVALID EMAIL OR PASSWORD"});
        }

        // CHECK IF USER IS VERIFIED
        if (!user.isVerfied) {
            return res.status(403).json({message : "Account Is Not Verified Yet" , isVerfied : false , email : user.email} ); // Go To Verify OTP Page
        }

        // CREATE TOKEN
        const token = jwt.sign({id : user._id , role : user.role} , process.env.JWT_SECRET , {expiresIn : process.env.JWT_EXPIRES_IN});
        res.status(200).json({message : "Login Successfull" , token});

        
    } catch (error) {
        console.log(error)
        res.status(500).json({message : "Internal Server Error"})
    }
});
// TODO VERFIY OTP
router.post("/verify-otp", async (req, res) => {
     try {
        const {error , value} = verifySchema.validate(req.body , {abortEarly : false});
        if (error) {
            return res.status(400).json({message : error.map((err) => err.message)});
        }

        const {email , otp} = value;

        // CHECK IF USER EXISTS
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message : "This Email Is Not Related To Any User"});
        }

        // CHECK IF OTP IS VALID
        if (user.otp !== otp) {
            return res.status(400).json({message : "Invalid OTP"});
        }

        // CHECK IF OTP IS EXPIRED
        if (user.otpExpired < Date.now()) {
            return res.status(400).json({message : "OTP expired"});
        }

        // VERIFY USER
        user.isVerfied = true;
        user.otp = undefined; // remove otp from user
        user.otpExpired = undefined;

        await user.save();

        // UPDATE USER IN DATABASE 
        // await User.findOneAndUpdate({email}, {isVerfied : true});
        res.status(200).json({message : "Account verified Successfully!"});
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message : "Internal Server Error"})
    }
});
// TODO FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
     try {
        // VALIDATION
        const {error , value} = forgotPasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({message : error.message});
        }

        const {email} = value;

        // CHECK IF USER EXISTS
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message : "User Does Not Exists"});
        }

        // crpto token => resetPasswordToken
        const resetPasswordToken = crypto.randomBytes(32).toString("hex");
        const resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        // UPDATE USER
        user.resetPasswordToken = resetPasswordToken;   
        user.resetPasswordExpire = resetPasswordExpire;

        await user.save(); 

        // CREATE RESET URL
        const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password/${resetPasswordToken}`;
        // SEND EMAIL
        await sendEmail(email , "Reset Password" , `Click On The Link To Reset Your Password ${resetUrl}`);

        res.status(200).json({message : "Reset Password Email Sent Successfully To Your Email..."});


        
    } catch (error) {
        console.log(error)
        res.status(500).json({message : "Internal Server Error"})
    }
});
// TODO RESET PASSWORD
router.post("/reset-password", async (req, res) => {
     try {
        const {error , value} = resetPasswordSchema.validate(req.body , {abortEarly : false});
        if (error) {
            return res.status(400).json({message : error.map((err) => err.message)});
        }

        const {token , newPassword} = value;

        // CHECK IF USER EXISTS
        const user = await User.findOne({resetPasswordToken : token , resetPasswordExpire : {$gt : Date.now()}});
        if (!user) {
            return res.status(400).json({message : "Invalid Token Or Token Expired"});
        }

        // Hash Password
        const HashedPassword = await bcrypt.hash(newPassword , 12);

        // UPDATE USER
        user.password = HashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({message : "Password Reset Successfully"});

    } catch (error) {
        console.log(error)
        res.status(500).json({message : "Internal Server Error"})
    }
});
// TODO RESEND OTP
router.post("/resend-otp", async (req, res) => {
     try {
        // VALIDATION
        const {error , value} = resendOtpSchema.validate(req.body);
        if (error) {
            return res.status(400).json({message : error.message});
        }

        const {email} = value;

        // CHECK IF USER EXISTS
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message : "This Email Is Not Related To Any User"});
        }

        // CHECK IF USER IS VERIFIED
        if (user.isVerfied) {
            return res.status(400).json({message : "Account Is Already Verified"}); 
        }

       // PREVENT SPAMMING
        if (user.otp && user.otpExpired > Date.now()) {
            return res.status(400).json({message : "Please Try Again After 10 Minutes"});
        }

         // Generate OTP
         const {otp , otpExpired} =  generateOtp();

        user.otp = otp;
        user.otpExpired = otpExpired;

        await user.save();

        // SEND EMAIL
        await sendEmail(user.email , "Verify Your Account" , `Your OTP is ${otp}`);

        res.status(200).json({message : "OTP Sent Successfully To Your Email"});

               
 
    } catch (error) {
        console.log(error)
        res.status(500).json({message : "Internal Server Error"})
    }
});
// TODO ME 
router.get("/me" , authMiddleware , async (req, res) => {
    try {
        // EXTRACT USER
        const id = req.user.id;
        // CHECK IF USER EXISTS
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({message : "User Does Not Exists"});
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error)
        res.status(500).json({message : "Internal Server Error"})
    }
});
module.exports = router;