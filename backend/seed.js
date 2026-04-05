const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("./models/User");
const PGStay = require("./models/PGStay");
const Room = require("./models/Room");
const Notification = require("./models/Notification");
const Feedback = require("./models/Feedback");
const Complaint = require("./models/Complaint");
const Booking = require("./models/Booking");
const Application = require("./models/Application");

const connectDB = require("./config/db");

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany();
  await PGStay.deleteMany();
  await Room.deleteMany();
  await Notification.deleteMany();
  await Feedback.deleteMany();
  await Complaint.deleteMany();
  await Booking.deleteMany();
  await Application.deleteMany();

  console.log("Cleared existing data...");

  // ── Admin Accounts (from Login.jsx) ──
  const admins = await User.create([
    {
      name: "Ageesh Cyriac Baiju",
      email: "ageeshcyriacbaiju33@gmail.com",
      password: "Ageesh@123",
      role: "admin",
      verificationStatus: "verified",
      trustScore: 100,
    },
    {
      name: "Anagha Sunny",
      email: "anaghasunny2@gmail.com",
      password: "Anagha@123",
      role: "admin",
      verificationStatus: "verified",
      trustScore: 100,
    },
    {
      name: "Aromal Harikumar",
      email: "aromalharikumar05@gmail.com",
      password: "Aromal@123",
      role: "admin",
      verificationStatus: "verified",
      trustScore: 100,
    },
    {
      name: "Dayona Suby",
      email: "dayonasuby@gmail.com",
      password: "Dayona@123",
      role: "admin",
      verificationStatus: "verified",
      trustScore: 100,
    },
  ]);

  console.log("Admin accounts created...");

  console.log("\n✅ Database seeded successfully!");
  console.log("\n── Login Credentials ──");
  console.log("Admin:  ageeshcyriacbaiju33@gmail.com / Ageesh@123 ,anaghasunny2@gmail.com / Anagha@123 ,aromalharikumar05@gmail.com / Aromal@123 ,dayonasuby@gmail.com / Dayona@123");

  process.exit();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});