const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()


// Custom imports
const HospitalController = require("./Routes/HospitalRoutes");
const PatientController = require("./Routes/PatientRoutes");

const PORT = process.env.PORT || 4500;


mongoose.connect(process.env.MONGOOSE_URI, {useNewUrlParser: true, useUnifiedTopology: true},()=>{
    console.log("Connected to Mongo Database");
});

module.exports = {
    express,
    mongoose,
    PORT,
    HospitalController,
    PatientController
}