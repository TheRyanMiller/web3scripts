const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = (message) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: 'cryptobot.notifications@gmail.com',
        pass: process.env.EMAIL_PASSWORD
        }
    });

    let mailOptions = {
        from: 'cryptobot.notifications@gmail.com'
    };

    mailOptions.to = process.env.MY_EMAIL;
    mailOptions.subject = "Token Price Alert";
    mailOptions.html = message;
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Alert email sent: ' + info.response);
        }
    });
}