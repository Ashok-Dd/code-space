import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { AppError } from "../utils/appError.js";

const SALT_ROUNDS = 10;
const TOKEN_TTL = "30d";

const toPublicUser = (user) => ({
  id: String(user._id),
  username: user.username,
  email: user.email,
  createdAt: user.createdAt,
});

export const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
};

export const verifyToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.sub;
  } catch {
    return null;
  }
};

export const getUserById = async (id) => {
  const user = await User.findById(id).catch(() => null);
  return user ? toPublicUser(user) : null;
};

export const signup = async ({ username, email, password }) => {
  if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
    throw new AppError("Username, email and password are required", 400);
  }
  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const usernameLower = username.trim().toLowerCase();
  const emailLower = email.trim().toLowerCase();

  const existing = await User.findOne({ $or: [{ usernameLower }, { email: emailLower }] }).lean();
  if (existing) {
    const field = existing.usernameLower === usernameLower ? "Username" : "Email";
    throw new AppError(`${field} is already taken`, 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  let user;
  try {
    user = await User.create({ username: username.trim(), email: emailLower, passwordHash });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError("Username or email is already taken", 409);
    }
    throw err;
  }

  return { user: toPublicUser(user), token: generateToken(user) };
};

export const login = async ({ identifier, password }) => {
  if (typeof identifier !== "string" || typeof password !== "string") {
    throw new AppError("Username/email and password are required", 400);
  }

  const normalized = identifier.trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ usernameLower: normalized }, { email: normalized }],
  }).select("+passwordHash");

  if (!user) {
    throw new AppError("Incorrect username/email or password", 401);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AppError("Incorrect username/email or password", 401);
  }

  return { user: toPublicUser(user), token: generateToken(user) };
};
