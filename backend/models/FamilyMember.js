const mongoose = require("mongoose");

const familySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    relationship: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    bloodType: String,
    gender: String,
    allergies: [String],
    conditions: [String],
    emergencyContact: String,
    phone: String,
    email: String,
    notes: String
}, { timestamps: true });

module.exports = mongoose.model("FamilyMember", familySchema);
