// models/Vendor.js
import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    businessName: {
      type: String,
      required: true,
    },

    commissionRate: {
      type: Number, // e.g., 5 = 5%
      default: 0,
    },

    totalCommissionEarned: {
      type: Number,
      default: 0,
    },

    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);
