import express from "express"
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"
import upload from "../middleware/multer.middleware.js"

const router = express.Router()

router.post("/signup", signup);

router.post("/login", async (req, res) => {
  try {
    await login(req, res);
  } catch (error) {
    console.error("Login error:", error); // Log the error for debugging
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

router.post("/logout", logout);

  

router.put("/update-profile", protectRoute, upload.single("profilePic"), updateProfile)


// Add /me route for frontend auth status check
router.get("/me", protectRoute, checkAuth)
router.get("/check", protectRoute, checkAuth)

export default router;
