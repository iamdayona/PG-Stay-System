const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pgStay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PGStay",
      required: true,
    },
    issue: {
      type: String,
      required: [true, "Issue description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "rejected"],
      default: "pending",
    },
    ownerAction: {
      type: String,
      enum: ["pending", "willResolve", "resolved"],
      default: "pending",
    },
    ownerResponse: {
      type: String,
      default: "",
    },
    messages: {
      type: [
        {
          sender: {
            type: String,
            enum: ["owner", "tenant", "admin"],
            required: true,
          },
          text: {
            type: String,
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
