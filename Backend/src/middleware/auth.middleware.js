import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {

        // Try to get token from cookies or Authorization header
        let token = req.cookies.jwt;
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        // Debug logging for token presence
        if (!token) {
            console.log("[AUTH] No token found. Cookies:", req.cookies, "Auth header:", req.headers.authorization);
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            console.log("[AUTH] JWT verification failed:", err.message, "Token:", token);
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        if(!decoded){
            console.log("[AUTH] Decoded token is null. Token:", token);
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            console.log("[AUTH] User not found for decoded userId:", decoded.userId);
            return res.status(404).json({ message: "Unauthorized - User Not Found" });
        }

        req.user = user;
        next();


    } catch (error) {
        console.log("Error in protectRoute middleware:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}