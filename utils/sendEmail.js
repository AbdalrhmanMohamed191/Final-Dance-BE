// IMPORTS
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
// CONFIG
dotenv.config();
// TRANSPORTER
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    } ,
    tls: {
        rejectUnauthorized: false
    }
});

async function sendEmail(to, subject, text , html = null){
    try {
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject,
            text,
            html
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {sendEmail};