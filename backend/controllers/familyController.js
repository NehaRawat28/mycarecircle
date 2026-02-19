const FamilyMember = require("../models/FamilyMember");

exports.addMember = async (req, res) => {
    try {
        const member = await FamilyMember.create({
            ...req.body,
            user: req.user.id // Using req.user.id from auth middleware
        });

        res.status(201).json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMembers = async (req, res) => {
    try {
        const members = await FamilyMember.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
