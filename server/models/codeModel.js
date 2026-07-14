import mongoose from "mongoose";

const SNIPPET_TTL_SECONDS =
  (Number(process.env.SNIPPET_TTL_DAYS) || 30) * 24 * 60 * 60;

const codeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "ID is required"],
      unique: true,
      trim: true,
      minlength: [3, "ID must be at least 3 characters"],
      maxlength: [50, "ID cannot exceed 50 characters"],
      match: [/^[A-Za-z0-9_-]+$/, "ID may only contain letters, numbers, hyphens and underscores"],
    },
    code: {
      // Not required: a freshly opened room starts as an empty snippet.
      type: String,
      maxlength: [100000, "Code cannot exceed 100KB"],
      default: "",
    },
    language: {
      type: String,
      trim: true,
      maxlength: [30, "Language cannot exceed 30 characters"],
      default: "plaintext",
    },
    passwordHash: {
      type: String,
      default: null,
      select: false,
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

codeSchema.index({ createdAt: -1 });
// Snippets auto-delete after a period of inactivity instead of living forever.
codeSchema.index({ lastAccessed: 1 }, { expireAfterSeconds: SNIPPET_TTL_SECONDS });

export const CodeSpace = mongoose.model("CodeSpace", codeSchema);
