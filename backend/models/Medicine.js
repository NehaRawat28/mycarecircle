const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    familyMember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FamilyMember"
    },
    name: {
        type: String,
        required: true
    },
    dosage: {
        type: String,
        required: true
    },
    frequency: String,
    times: [String], // Array of time strings like ["08:00", "20:00"]
    startDate: Date,
    endDate: Date,
    instructions: String,
    reminderSettings: {
        smsReminder: {
            type: Boolean,
            default: false
        },
        emailReminder: {
            type: Boolean,
            default: false
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("Medicine", medicineSchema);
