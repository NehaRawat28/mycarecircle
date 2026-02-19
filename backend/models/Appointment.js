const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    familyMember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FamilyMember"
    },
    doctor: {
        type: String,
        required: true
    },
    specialty: String,
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["Check-up", "Follow-up", "Consultation", "Emergency", "Procedure"],
        default: "Consultation"
    },
    duration: {
        type: Number, // in minutes
        default: 30
    },
    location: String,
    notes: String,
    status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "cancelled"],
        default: "pending"
    },
    sendReminder: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
