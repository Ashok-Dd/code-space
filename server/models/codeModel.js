import mongoose from "mongoose";

export const SNIPPET_TTL_MS =
  (Number(process.env.SNIPPET_TTL_DAYS) || 30) * 24 * 60 * 60 * 1000;

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
    // Null for an anonymous room. Set once, at creation, if the creator was
    // logged in — ownership is never transferred after the fact.
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    // Sliding expiry for anonymous rooms only (refreshed on every join/edit).
    // Left null for owned rooms, which Mongo's TTL monitor simply skips —
    // owned snippets never expire.
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

codeSchema.index({ createdAt: -1 });
codeSchema.index({ ownerId: 1, updatedAt: -1 });
codeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const CodeSpace = mongoose.model("CodeSpace", codeSchema);
