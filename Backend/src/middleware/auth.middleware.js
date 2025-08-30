import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization?.split(" ")[1];
    const tokenFromCookie = req.cookies?.jwt || req.cookies?.token || req.headers["x-access-token"];
    const token = authHeader || tokenFromCookie;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id || decoded._id || decoded.userId;
    req.user = await User.findById(req.userId).select("-password");
    next();
  } catch (err) {
    console.error("protectRoute error:", err && err.message ? err.message : err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};