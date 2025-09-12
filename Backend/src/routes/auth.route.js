import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

// @desc    Register new user
// @route   POST /api/auth/signup
router.post("/signup", signup);

// @desc    Login user
// @route   POST /api/auth/login
router.post("/login", login);

// @desc    Logout user
// @route   POST /api/auth/logout
router.post("/logout", logout);

// @desc    Update profile (with file upload)
// @route   PUT /api/auth/update-profile
router.put(
  "/update-profile",
  protectRoute,
  upload.single("profilePic"),
  updateProfile
);

// @desc    Get logged-in user info
// @route   GET /api/auth/me
router.get("/me", protectRoute, checkAuth);

// Optional health check route
router.get("/check", (req, res) => {
  res.json({ message: "Auth service is running ✅" });
});

export default router;

