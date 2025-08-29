import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
// Ensure Cloudinary is configured before any upload
import dotenv from "dotenv";
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Signup Controller
export const signup = async (req, res) => {
  const { fullName, email, password, gender, language } = req.body;

  try {

    if(!fullName || !email || !password || !gender || !language) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // validate password length
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      gender,
      language,
    });

        if (newUser) {
            // ... (generate token and save user)

            await newUser.save();
            // ... (send response)
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        // ... (error handling)
    }
};

// Login Controller
export const login = async (req, res) => {
    console.log("Login attempt with body:", req.body); // <-- Add this line
  try {
		const { email, password } = req.body;

		// 1. Find the user by their email, which is used during signup
		const user = await User.findOne({ email });

		let isPasswordCorrect = false;
		// if user is not found compare a dummy password to prevent timing attacks
		if (!user) {
			try {
				await bcrypt.compare(
					"dummyPassword",
					"$2a$10$9xy9vE8tk4fbJ.7y9XBqZeWX7hJcnT86Z0HyvHHtzE//9KzZKeUtm"
				);
			} catch (dummyCompareError) {
				console.error("Dummy password comparison error:", dummyCompareError);
				return res
					.status(500)
					.json({ message: "Internal Server Error during dummy password comparison" });
			}
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// 2. Use bcrypt.compare to check passwords.
    try {
      isPasswordCorrect = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error("Password comparison error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }


		if (!isPasswordCorrect) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// If credentials are correct, generate a token and send the response.
		const token = generateToken(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			profilePic: user.profilePic,
			token: token,
		});
	} catch (error) {
		console.error("Error in login controller", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

// Logout Controller
export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("❌ Error in logout controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Add this new function and export it
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash password if it's being updated
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Upload new profile picture to Cloudinary if it exists
    if (req.file) {
      // Destroy old image if it exists
      if (user.profilePicId) {
        await cloudinary.uploader.destroy(user.profilePicId);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_pics",
        width: 150,
        height: 150,
        crop: "fill",
      });
      user.profilePic = result.secure_url;
      user.profilePicId = result.public_id;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;

    await user.save();

    // Return updated user info (without password)
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("❌ Error in updateProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
  };


// Check Auth Status Controller
export const checkAuth = async (req, res) => {
  try {
    // req.user is populated by the protectRoute middleware, which runs before this.
    // If the middleware succeeds, the user is authenticated.
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
