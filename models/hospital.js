const mongoose = require("mongoose");

const HospitalSchema = new mongoose.Schema(
{
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    address: { type: String, required: true },
    patients: [{
      status: { type: Boolean, required: true },
      data: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hospital", HospitalSchema);
