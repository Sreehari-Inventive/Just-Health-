const mongoose = require("mongoose");

const DetailSchema = new mongoose.Schema(
  {
    name: { type: String, required: true},
    age: { type: Number, required: true},
    symptoms: { type: Array, required: true},
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Details", DetailSchema);