const mongoose = require("mongoose");

const reminderLogSchema = new mongoose.Schema({
    medicineId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Medicine"
    },
    familyMemberId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"FamilyMember"
    },
    scheduledTime:Date,
    status:{
        type:String,
        enum:["pending","sent","taken","missed"],
        default:"pending"
    }
},{timestamps:true});

module.exports = mongoose.model("ReminderLog", reminderLogSchema);
