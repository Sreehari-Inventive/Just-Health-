const mongoose = require("mongoose");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const HospitalInterestSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    address: { type: String, required: true },
    phone:{type: String, required:true},
    isPhoneVerified : {type:Boolean, required: true},
    currentOTP:{type:String, required: true},
    otpExpireTime:{type: String}
  },
  { timestamps: true }
);

module.exports = mongoose.model("HospitalInterest", HospitalInterestSchema);
