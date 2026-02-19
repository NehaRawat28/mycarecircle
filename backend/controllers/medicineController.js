const Medicine = require("../models/Medicine");

exports.addMedicine = async (req, res) => {
    try {
        console.log("Adding medicine with data:", req.body);
        console.log("User ID:", req.user.id);
        
        const medicine = await Medicine.create({
            ...req.body,
            user: req.user.id
        });

        console.log("Medicine created:", medicine);
        res.status(201).json(medicine);
    } catch (err) {
        console.error("Error adding medicine:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getMedicines = async (req, res) => {
    try {
        const { familyMemberId } = req.query;
        console.log("Getting medicines for user:", req.user.id);
        console.log("Family member filter:", familyMemberId);
        
        let query = { user: req.user.id };
        
        // If familyMemberId is provided, filter by it
        if (familyMemberId) {
            query.familyMember = familyMemberId;
        }
        
        console.log("Query:", query);
        
        const medicines = await Medicine.find(query).sort({ createdAt: -1 });
        
        console.log("Found medicines:", medicines);
        res.json(medicines);
    } catch (err) {
        console.error("Error getting medicines:", err);
        res.status(500).json({ error: err.message });
    }
};
