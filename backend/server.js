const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("DB Connected"))
.catch(err=>console.log(err));

// Register routes before starting server
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/family", require("./routes/familyRoutes"));
app.use("/api/medicines", require("./routes/medicineRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/emergency", require("./routes/emergencyRoutes"));

app.get("/", (req,res)=>{
    res.send("Health Tracker API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server running on ${PORT}`));

const startReminderJob = require("./jobs/reminderJob");
startReminderJob();
