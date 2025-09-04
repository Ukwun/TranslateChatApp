import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";

const router = express.Router();

router.put("/me/language", protectRoute, async (req, res) => {
  const { preferredLang } = req.body;
  if (!preferredLang) return res.status(400).json({ message: "preferredLang required" });
  const user = await User.findByIdAndUpdate(req.userId, { preferredLang }, { new: true }).select("-password");
  res.json({ user });
});

export default router;
