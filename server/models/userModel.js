import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[A-Za-z0-9_-]+$/, "Username may only contain letters, numbers, hyphens and underscores"],
    },
    // Lowercased mirror of username, used for case-insensitive uniqueness/lookup
    // without forcing the display name itself to lowercase.
    usernameLower: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("validate", function setUsernameLower(next) {
  if (this.username) this.usernameLower = this.username.toLowerCase();
  next();
});

export const User = mongoose.model("User", userSchema);
