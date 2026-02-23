const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("./models/User");
const PGStay = require("./models/PGStay");
const Room = require("./models/Room");

const connectDB = require("./config/db");

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany();
  await PGStay.deleteMany();
  await Room.deleteMany();

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

  // ── Sample Owners ──
  const owners = await User.create([
    {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      password: "Owner@123",
      role: "owner",
      phone: "+91 9876543210",
      verificationStatus: "verified",
      trustScore: 92,
    },
    {
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      password: "Owner@123",
      role: "owner",
      phone: "+91 9876541234",
      verificationStatus: "pending",
      trustScore: 80,
    },
  ]);

  console.log("Owner accounts created...");

  // ── Sample Tenants ──
  const tenants = await User.create([
    {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "Tenant@123",
      role: "tenant",
      phone: "+91 9876543210",
      gender: "male",
      verificationStatus: "verified",
      trustScore: 85,
      profileCompletion: 90,
      preferences: {
        location: "Noida",
        budgetMin: 5000,
        budgetMax: 10000,
        roomType: "Single",
        amenities: ["WiFi", "AC"],
      },
    },
    {
      name: "Priya Mehta",
      email: "priya.mehta@example.com",
      password: "Tenant@123",
      role: "tenant",
      phone: "+91 9876541111",
      gender: "female",
      verificationStatus: "verified",
      trustScore: 92,
      profileCompletion: 100,
      preferences: {
        location: "Delhi",
        budgetMin: 8000,
        budgetMax: 15000,
        roomType: "Double",
        amenities: ["WiFi", "Meals"],
      },
    },
  ]);

  console.log("Tenant accounts created...");

  // ── Sample PG Stays ──
  const pgs = await PGStay.create([
    {
      owner: owners[0]._id,
      name: "Green Valley PG",
      location: "Sector 62, Noida",
      rent: 8000,
      amenities: ["WiFi", "AC", "Meals", "Laundry"],
      trustScore: 92,
      verificationStatus: "verified",
      description: "Premium PG with all modern amenities.",
    },
    {
      owner: owners[0]._id,
      name: "Sunshine Residency",
      location: "GTB Nagar, Delhi",
      rent: 12000,
      amenities: ["WiFi", "Meals", "Laundry"],
      trustScore: 88,
      verificationStatus: "pending",
      description: "Comfortable PG near metro station.",
    },
    {
      owner: owners[1]._id,
      name: "Student Haven",
      location: "Kalkaji, Delhi",
      rent: 9500,
      amenities: ["WiFi", "AC"],
      trustScore: 85,
      verificationStatus: "verified",
      description: "Budget-friendly PG for students.",
    },
    {
      owner: owners[1]._id,
      name: "Comfort Stay PG",
      location: "Sector 15, Noida",
      rent: 7500,
      amenities: ["WiFi", "Meals"],
      trustScore: 90,
      verificationStatus: "pending",
      description: "Homely atmosphere with great food.",
    },
  ]);

  console.log("PG Stays created...");

  // ── Sample Rooms ──
  const roomData = [
    // Green Valley PG
    { pgStay: pgs[0]._id, roomType: "Single Room", capacity: 1, rent: 7000, availability: true },
    { pgStay: pgs[0]._id, roomType: "Single AC Room", capacity: 1, rent: 8000, availability: true },
    { pgStay: pgs[0]._id, roomType: "Double Room", capacity: 2, rent: 6000, availability: false },
    { pgStay: pgs[0]._id, roomType: "Double AC Room", capacity: 2, rent: 9000, availability: true },

    // Sunshine Residency
    { pgStay: pgs[1]._id, roomType: "Single Room", capacity: 1, rent: 10000, availability: true },
    { pgStay: pgs[1]._id, roomType: "Double Room", capacity: 2, rent: 12000, availability: true },
    { pgStay: pgs[1]._id, roomType: "Triple Room", capacity: 3, rent: 9000, availability: false },

    // Student Haven
    { pgStay: pgs[2]._id, roomType: "Single Room", capacity: 1, rent: 8000, availability: true },
    { pgStay: pgs[2]._id, roomType: "Single AC Room", capacity: 1, rent: 9500, availability: true },

    // Comfort Stay PG
    { pgStay: pgs[3]._id, roomType: "Single Room", capacity: 1, rent: 7500, availability: true },
    { pgStay: pgs[3]._id, roomType: "Double Room", capacity: 2, rent: 6500, availability: true },
  ];

  const rooms = await Room.insertMany(roomData);

  // Update available/total room counts on PGs
  for (const pg of pgs) {
    const pgRooms = rooms.filter(
      (r) => r.pgStay.toString() === pg._id.toString()
    );
    const available = pgRooms.filter((r) => r.availability).length;
    await PGStay.findByIdAndUpdate(pg._id, {
      totalRooms: pgRooms.length,
      availableRooms: available,
    });
  }

  console.log("Rooms created...");
  console.log("\n✅ Database seeded successfully!");
  console.log("\n── Login Credentials ──");
  console.log("Admin:  ageeshcyriacbaiju33@gmail.com / Ageesh@123");
  console.log("Owner:  rajesh.kumar@example.com / Owner@123");
  console.log("Tenant: john.doe@example.com / Tenant@123");

  process.exit();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});