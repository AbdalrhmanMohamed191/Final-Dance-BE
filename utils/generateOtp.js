const { generate } = require('otp-generator');

function generateOtp() {
    const otp = generate(6 , 
            {
                upperCaseAlphabets : false,
                lowerCaseAlphabets : false,
                specialChars : false
            });
     const otpExpired = new Date(Date.now() + 10 * 60 * 1000);

     return {otp , otpExpired};       
    }

module.exports = {generateOtp};