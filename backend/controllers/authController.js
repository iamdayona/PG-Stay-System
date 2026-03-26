const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "All fields are required" });

    if (!["tenant", "owner"].includes(role))
  return res.status(400).json({ message: "Role must be tenant or owner" });

    // Name: alphabets and spaces only
    if (!/^[A-Za-z\s]+$/.test(name.trim()))
      return res.status(400).json({ message: "Name must contain alphabets only (no numbers or special characters)." });

    // Password requirements: min 5 chars, at least one letter, one number, one special char
    if (password.length < 5)
      return res.status(400).json({ message: "Password must be at least 5 characters long." });
    if (!/[A-Za-z]/.test(password))
      return res.status(400).json({ message: "Password must contain at least one letter." });
    if (!/[0-9]/.test(password))
      return res.status(400).json({ message: "Password must contain at least one number." });
    if (!/[^A-Za-z0-9]/.test(password))
      return res.status(400).json({ message: "Password must contain at least one special character (e.g. !@#$%)." });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore,
        verificationStatus: user.verificationStatus,
        profileCompletion: user.profileCompletion,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isActive)
      return res.status(403).json({ message: "Your account has been suspended" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore,
        verificationStatus: user.verificationStatus,
        profileCompletion: user.profileCompletion,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, gender, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    // Recalculate profile completion
    let completion = 40;
    if (user.name) completion += 15;
    if (user.phone) completion += 15;
    if (user.gender) completion += 10;
    if (user.verificationStatus === "verified") completion += 20;
    user.profileCompletion = Math.min(completion, 100);

    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
