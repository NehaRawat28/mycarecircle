const EmergencyContact = require("../models/EmergencyContact");

exports.addContact = async (req, res) => {
    try {
        const contact = await EmergencyContact.create({
            ...req.body,
            user: req.user.id
        });

        res.status(201).json(contact);
    } catch (err) {
        console.error("Error adding emergency contact:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getContacts = async (req, res) => {
    try {
        const contacts = await EmergencyContact.find({
            user: req.user.id
        }).sort({ createdAt: -1 });
        
        res.json(contacts);
    } catch (err) {
        console.error("Error getting emergency contacts:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        
        const contact = await EmergencyContact.findOneAndUpdate(
            { _id: id, user: req.user.id },
            req.body,
            { new: true }
        );
        
        if (!contact) {
            return res.status(404).json({ error: "Contact not found" });
        }
        
        res.json(contact);
    } catch (err) {
        console.error("Error updating emergency contact:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        
        const contact = await EmergencyContact.findOneAndDelete({
            _id: id,
            user: req.user.id
        });
        
        if (!contact) {
            return res.status(404).json({ error: "Contact not found" });
        }
        
        res.json({ message: "Emergency contact deleted successfully" });
    } catch (err) {
        console.error("Error deleting emergency contact:", err);
        res.status(500).json({ error: err.message });
    }
};
