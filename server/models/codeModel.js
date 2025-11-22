import mongoose from "mongoose";

const codeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "ID is required"],
      unique: true,
      trim: true,
      minlength: [3, "ID must be at least 3 characters"],
      maxlength: [50, "ID cannot exceed 50 characters"],
    },
    code: {
      type: String,
      required: [true, "Code is required"],
      maxlength: [100000, "Code cannot exceed 100KB"],
    },
    views: {
      type: Number,
      default: 0,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// KEEP ONLY THIS INDEX
codeSchema.index({ createdAt: -1 });

export const CodeSpace = mongoose.model("CodeSpace", codeSchema);
