import bcrypt from "bcryptjs";
import { CodeSpace } from "../models/codeModel.js";
import { AppError } from "../utils/appError.js";

const ID_PATTERN = /^[A-Za-z0-9_-]{3,50}$/;
const SALT_ROUNDS = 10;

export const isValidId = (id) => typeof id === "string" && ID_PATTERN.test(id);

const assertValidId = (id) => {
  if (!isValidId(id)) {
    throw new AppError(
      "ID must be 3-50 characters and contain only letters, numbers, hyphens and underscores",
      400
    );
  }
};

// Throws if the snippet is password-protected and the given password doesn't
// match. A snippet with no passwordHash is open to everyone.
const assertPasswordAccess = async (snippet, password) => {
  if (!snippet.passwordHash) return;
  if (!password) throw new AppError("This snippet is password-protected", 401);
  const ok = await bcrypt.compare(password, snippet.passwordHash);
  if (!ok) throw new AppError("Incorrect password", 403);
};

const stripHash = (snippet) => {
  if (!snippet) return snippet;
  const { passwordHash, ...rest } = snippet;
  return rest;
};

// Fetches a snippet, creating an empty one on first visit (used when a user
// opens the editor for an id, e.g. via the "join" socket event). Returns the
// raw doc (including passwordHash) so the caller can decide whether to gate
// access — this does NOT itself check the password.
export const getOrCreateSnippet = async (id) => {
  assertValidId(id);

  try {
    return await CodeSpace.findOneAndUpdate(
      { id },
      {
        $setOnInsert: { id, code: "", language: "plaintext" },
        $inc: { views: 1 },
        $set: { lastAccessed: new Date() },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )
      .select("+passwordHash")
      .lean();
  } catch (err) {
    // Two clients joining the same brand-new room at once can race the
    // upsert (e.g. React StrictMode's double-effect in dev); the loser just
    // reads back the document the winner created instead of failing to join.
    if (err.code === 11000) {
      const existing = await CodeSpace.findOne({ id }).select("+passwordHash").lean();
      if (existing) return existing;
    }
    throw err;
  }
};

export const isPasswordCorrect = (snippet, password) => {
  if (!snippet.passwordHash) return true;
  if (!password) return false;
  return bcrypt.compare(password, snippet.passwordHash);
};

// Sets, changes, or (with an empty/null password) removes a snippet's password.
export const setSnippetPassword = async (id, password) => {
  assertValidId(id);

  const passwordHash =
    typeof password === "string" && password.length > 0
      ? await bcrypt.hash(password, SALT_ROUNDS)
      : null;

  const snippet = await CodeSpace.findOneAndUpdate(
    { id },
    { $set: { passwordHash, lastAccessed: new Date() } },
    { new: true }
  ).lean();

  if (!snippet) {
    throw new AppError("Code not found", 404);
  }

  return { isProtected: !!passwordHash };
};

// Fetches a snippet without creating one — used by the plain-text REST
// endpoint so curl/API access 404s on a typo instead of silently creating a room.
export const getSnippet = async (id, password) => {
  assertValidId(id);

  const snippet = await CodeSpace.findOne({ id }).select("+passwordHash").lean();
  if (!snippet) {
    throw new AppError("Code not found", 404);
  }
  await assertPasswordAccess(snippet, password);
  return stripHash(snippet);
};

export const updateSnippetContent = async (id, { code, language } = {}, password) => {
  assertValidId(id);

  const existing = await CodeSpace.findOne({ id }).select("+passwordHash").lean();
  if (existing) await assertPasswordAccess(existing, password);

  const set = { lastAccessed: new Date() };
  if (typeof code === "string") set.code = code;
  if (typeof language === "string" && language.trim()) set.language = language.trim();

  const snippet = await CodeSpace.findOneAndUpdate(
    { id },
    { $set: set, $setOnInsert: { id } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  return snippet;
};

export const deleteSnippet = async (id, password) => {
  assertValidId(id);

  const existing = await CodeSpace.findOne({ id }).select("+passwordHash").lean();
  if (!existing) {
    throw new AppError("Code not found", 404);
  }
  await assertPasswordAccess(existing, password);

  await CodeSpace.deleteOne({ id });
  return existing;
};

export const getSnippetStats = async (id) => {
  assertValidId(id);

  const snippet = await CodeSpace.findOne({ id })
    .select("id language views createdAt updatedAt lastAccessed")
    .lean();
  if (!snippet) {
    throw new AppError("Code not found", 404);
  }
  return snippet;
};
