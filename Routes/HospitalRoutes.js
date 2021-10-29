require("dotenv").config({ path: "./../.env" });
const router = require("express").Router();

const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const verify = require("../verifyToken");

// importing Models
const Hospital = require("../models/hospital");
const Patient = require("../models/users");
const HospitalInterest = require("../models/HospitalInterest");
const User = require("../models/users");

// importing Functions
const { sendEmail } = require("./../functions/emails");
const { sendSMS } = require("./../functions/sendSMS");

router.get("/", (req, res) => {
  res.json({ status: "hospital done" });
});

//Register
router.post("/register", async (req, res) => {
  try {
    const newHospital = await new Hospital({
      name: req.body.name,
      image: req.body.image,
      address: req.body.address,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString(),
      patients: req.body.patients,
    });

    const hospital = await newHospital.save();
    let emailStatus = sendEmail(
      [newHospital.email],
      " Application Approved! - Congrats, " + newHospital.name,
      JSON.stringify(newHospital)
    );

    if (!emailStatus) res.status(501).json({ error: "Email Sending Error" });

    res.status(201).json(hospital);
  } catch (err) {
    res.status(500).send(err);
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const hosp = await Hospital.findOne({ email: req.body.email });
    if (!hosp) {
      res.status(401).json("Wrong password or username!");
      return;
    }

    const bytes = CryptoJS.AES.decrypt(hosp.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== req.body.password) {
      res.status(401).json("Wrong password or username!");
      return;
    }
    let document_to_send = hosp._doc;
    delete document_to_send.password;

    const accessToken = jwt.sign(document_to_send, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    res.status(200).json({ document_to_send, accessToken });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// interest form
router.post("/interest-form", async (req, res) => {
  try {
    let currOTP = Math.trunc(Math.random() * Math.pow(10, 8));
    let hospitalInterestObject = {
      name: req.body.name,
      image: req.body.image,
      address: req.body.address,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString(),
      phone: req.body.phone,
      isPhoneVerified: false,
      currentOTP: currOTP,
      otpExpireTime: new Date().getTime() + 1000 * 60 * 10,
    };
    const newHospitalInterest = await new HospitalInterest(
      hospitalInterestObject
    );

    const hospitalInterest = await newHospitalInterest.save();

    let emailStatus = sendEmail(
      [process.env.ADMIN_EMAIL],
      " New Hospital requesting to Gregister, Hospital Name -  " +
        hospitalInterestObject.name,
      JSON.stringify(hospitalInterestObject)
    );
    if (!emailStatus) res.status(501).json({ error: "Email Sending Error" });

    let smsStatus = await sendSMS(
      req.body.phone,
      "Your otp is " + currOTP + ". Valid for 10mins only"
    );

    if (!smsStatus) res.status(501).json({ error: "SMS Sending Error" });

    delete hospitalInterestObject.password;
    delete hospitalInterestObject.currentOTP;

    res.status(201).json(hospitalInterestObject);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// otpVerificationAPI
router.post("/otpVerify", async (req, res) => {
  try {
    let getotp = req.body.otp;
    let phone = req.body.phone;
    if (getotp.length != 8 || phone.length < 10) {
      res.status(501).json({ error: "OTP INCORRECT!" });
      return;
    }

    const fetchedHospital = await HospitalInterest.findOne({
      phone: req.body.phone,
    })
      .select("currentOTP email isPhoneVerified otpExpireTime")
      .exec();

    if (!fetchedHospital) {
      res.status(501).json({ error: "Phone Number not exists!" });
      return;
    }
    console.log(fetchedHospital, "+", getotp);
    if (fetchedHospital.currentOTP != getotp) {
      res.status(501).json({ error: "OTP INCORRECT! after checking !" });
      return;
    }

    let lastTime =
      new Date().getTime() -
      new Date(Number(fetchedHospital.otpExpireTime)).getTime();
    if (lastTime < 0) {
      res.status(501).json({ error: "Unexpected error" });
      return;
    }

    let LIMIT = 1000 * 60 * 10; //valid itll 10mins only
    if (lastTime > LIMIT) {
      res
        .status(501)
        .json({ error: "Time LIMIT ENDED, please again generate OTP" });
      return;
    }
    console.log(
      lastTime +
        " ds" +
        LIMIT +
        "##" +
        new Date(Number(fetchedHospital.otpExpireTime)).getTime()
    );
    let updateStatus = await HospitalInterest.updateOne(
      { phone: phone },
      { isPhoneVerified: true }
    );
    if (!updateStatus) {
      res.status(501).json({ error: "UPDATE FAILED OTP VERIFICATION" });
      return;
    }

    res.status(200).json({ message: "OTP Verified!!!", status: "true" });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Requesting to join hospital as member
router.post("/requestFromPatient", async (req, res) => {
  // request contains
  // - Patient ID
  // - Hospital ID
  //
  try {
    let patientID = req.body.patientID;
    let hospitalID = req.body.hospitalID;

    let patientobjectstatus = await Patient.exists({ _id: patientID });
    
    if (!patientobjectstatus) {
      res.status(501).json({ error: "PATIENT ID INVALID" });
      return false;
    }

    let hospitalobject = await Hospital.findOne({ _id: hospitalID });
    if (!hospitalobject) {
      res.status(501).json({ error: "SOME ERROR DURING UPDATING" });
      return;
    }
  


    
    
    

    hospitalobject.patients.push({
      status: false,
      data: patientID,
    });

    

    let s = await hospitalobject.save();
    let emailStatus = sendEmail(
      [newHospital.email],
      " Application Approved! - Congrats, " + newHospital.name,
      JSON.stringify(newHospital)
    );
    if (!emailStatus) {
      res.status(501).json({ error: "Error sending e-mail" });
      return;
    }
    if (!s) {
      res.status(501).json({ error: "SOME ERROR DURING UPDATING" });
      return;
    }

    res
      .status(201)
      .json({
        requestStatus: "sent to hospital",
        patientID: patientID,
        hospitalID: hospitalID,
      });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

//get all users

router.get("/users", verify, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find({}, "-password");

    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
