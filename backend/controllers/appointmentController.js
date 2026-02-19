const Appointment = require("../models/Appointment");

exports.addAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.create({
            ...req.body,
            user: req.user.id
        });

        res.status(201).json(appointment);
    } catch (err) {
        console.error("Error adding appointment:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAppointments = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = { user: req.user.id };
        
        // Filter by status if provided
        if (status) {
            query.status = status;
        }
        
        const appointments = await Appointment.find(query)
            .populate("familyMember", "name relationship")
            .sort({ date: 1, time: 1 });
        
        res.json(appointments);
    } catch (err) {
        console.error("Error getting appointments:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const appointment = await Appointment.findOneAndUpdate(
            { _id: id, user: req.user.id },
            req.body,
            { new: true }
        );
        
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }
        
        res.json(appointment);
    } catch (err) {
        console.error("Error updating appointment:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const appointment = await Appointment.findOneAndDelete({
            _id: id,
            user: req.user.id
        });
        
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }
        
        res.json({ message: "Appointment deleted successfully" });
    } catch (err) {
        console.error("Error deleting appointment:", err);
        res.status(500).json({ error: err.message });
    }
};
