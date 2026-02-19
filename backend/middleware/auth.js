const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log("Auth Middleware - Token:", token);

    if (!token) {
        console.log("Auth Middleware - No token provided");
        return res.status(401).json({ msg: "No token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Auth Middleware - Decoded:", decoded);

        // Normalize user ID
        const userId = decoded.id || decoded.userId || decoded._id;

        req.user = {
            id: userId,
            ...decoded
        };
        next();
    } catch (err) {
        console.error("Auth Middleware - Error:", err.message);
        res.status(401).json({ msg: "Invalid token" });
    }
};
