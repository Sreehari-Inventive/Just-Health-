const nodemailer = require("nodemailer");
require('dotenv').config({path:'./../.env'})


var transporter =nodemailer.createTransport({      
    host: "smtp.gmail.com",
    auth: {
      type: "login", // default
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
 const sendEmail = async function(to=undefined,subject=undefined,html=undefined){
    if(!(to && subject && html)){ return null; }

    try{
        const mailOptions = {
            from: process.env.EMAIL,
            to: to,
            subject: subject,
            html:html
        };
        console.log("SENDING EMAIL")
        return await transporter.sendMail(mailOptions)
    }catch(err){
        console.log("EMAIL SENDING FUNCTIONE ERRROR "+ err)
        return false;
    }

}
//  let exec = async ()=>{
//      console.log(await sendEmail("u19ee003@eed.svnit.in","SF","SFEDE"));
//  }
//  exec();

module.exports = {
    sendEmail
}