const mongoose = require("mongoose");
const FamilyMember = require("./models/FamilyMember");
const User = require("./models/User");
require("dotenv").config();

const testFamilyMember = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Find the demo user
        const demoUser = await User.findOne({ email: "demo@example.com" });
        if (!demoUser) {
            console.log("Demo user not found");
            process.exit(1);
        }

        console.log("Demo user found:", demoUser._id);

        // Create a test family member
        const testMember = await FamilyMember.create({
            user: demoUser._id,
            name: "Test Family Member",
            relationship: "Child",
            age: 10,
            bloodType: "O+",
            gender: "Male",
            allergies: ["Peanuts"],
            conditions: ["Asthma"],
            emergencyContact: "123-456-7890",
            notes: "Test member"
        });

        console.log("Test family member created:", testMember);

        // Fetch all family members for this user
        const allMembers = await FamilyMember.find({ user: demoUser._id });
        console.log("All family members:", allMembers);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

testFamilyMember();