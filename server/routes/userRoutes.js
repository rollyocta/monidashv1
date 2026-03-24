import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// REGISTER USER
router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN USER
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        xp: user.xp,
        level: user.level
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// PROTECTED ROUTE
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// DAILY LOGIN CLAIM
router.post("/daily-claim", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date();
    const lastClaim = user.lastClaimDate;

    // check if already claimed today
    if (lastClaim && lastClaim.toDateString() === today.toDateString()) {
      return res.status(400).json({ message: "Already claimed today" });
    }

    // check if missed previous day → reset streak
    if (lastClaim) {
      const diff = Math.floor((today - lastClaim) / (1000 * 60 * 60 * 24)); // days diff
      if (diff > 1) {
        user.streakDay = 1; // reset streak
      } else {
        user.streakDay = Math.min(user.streakDay + 1, 7); // increment streak max 7
      }
    } else {
      user.streakDay = 1; // first claim
    }

    // add XP for daily claim (optional: streak multiplier)
    const xpGain = 5 + (user.streakDay - 1) * 2; // day1=5, day2=7, day3=9...
    user.xp += xpGain;

    // level up check
    if (user.xp >= user.level * 100) {
      user.level += 1;
      user.xp = 0;
    }

    user.lastClaimDate = today;
    await user.save();

    res.json({
      message: `Daily XP claimed! +${xpGain} XP`,
      xp: user.xp,
      level: user.level,
      streakDay: user.streakDay,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;