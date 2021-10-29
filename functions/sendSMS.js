require('dotenv').config({path:'./../.env'})

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


const sendSMS = async function(to=undefined,message="testing by default paramater",from=process.env.TWILIO_PHONE_NUMBER){
   if(!(from && to)){
        return null;
   }
   return await client.messages.create({
       body: message,
       from: from,
       to: to
   });
   
}
module.exports = {
    sendSMS
}