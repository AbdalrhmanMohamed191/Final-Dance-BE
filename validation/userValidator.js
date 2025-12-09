const joi = require("joi");

const registerSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
});

const verifySchema = joi.object({
    email: joi.string().email().required(),
    otp: joi.string().length(6).required(),
});

const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),

});

const resendOtpSchema = joi.object({
    email: joi.string().email().required(),

});

const forgotPasswordSchema = joi.object({
    email: joi.string().email().required(),
});

const resetPasswordSchema = joi.object({
    token: joi.string().required(),
    newPassword: joi.string().min(6).required(),

});

module.exports = { registerSchema , verifySchema , loginSchema , resendOtpSchema , forgotPasswordSchema , resetPasswordSchema };