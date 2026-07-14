import bcrypt from "bcryptjs";
import { CodeSpace, SNIPPET_TTL_MS } from "../models/codeModel.js";
import { AppError } from "../utils/appError.js";

const ID_PATTERN = /^[A-Za-z0-9_-]{3,50}$/;
const SALT_ROUNDS = 10;
const PREVIEW_LENGTH = 300;

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

// Anonymous (unowned) rooms stay open to anyone who's already interacting
// with them (matches the original, pre-accounts behavior). Owned rooms
// restrict protection/deletion to the owner.
const assertOwnership = (snippet, requesterId) => {
  if (!snippet.ownerId) return;
  if (!requesterId || String(snippet.ownerId) !== String(requesterId)) {
    throw new AppError("Only the owner can do that", 403);
  }
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
export const getOrCreateSnippet = async (id, ownerId = null) => {
  assertValidId(id);

  let snippet;
  try {
    snippet = await CodeSpace.findOneAndUpdate(
      { id },
      {
        $setOnInsert: {
          id,
          code: "",
          language: "plaintext",
          ownerId,
          expiresAt: ownerId ? null : new Date(Date.now() + SNIPPET_TTL_MS),
        },
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
      snippet = await CodeSpace.findOne({ id }).select("+passwordHash").lean();
      if (!snippet) throw err;
    } else {
      throw err;
    }
  }

  // Sliding expiry for anonymous rooms — refreshed on every visit. Owned
  // rooms keep expiresAt as null so Mongo's TTL monitor never touches them.
  if (!snippet.ownerId) {
    const expiresAt = new Date(Date.now() + SNIPPET_TTL_MS);
    await CodeSpace.updateOne({ id }, { $set: { expiresAt } });
    snippet.expiresAt = expiresAt;
  }

  return snippet;
};

export const isPasswordCorrect = (snippet, password) => {
  if (!snippet.passwordHash) return true;
  if (!password) return false;
  return bcrypt.compare(password, snippet.passwordHash);
};

// Sets, changes, or (with an empty/null password) removes a snippet's password.
export const setSnippetPassword = async (id, password, requesterId = null) => {
  assertValidId(id);

  const existing = await CodeSpace.findOne({ id }).select("ownerId").lean();
  if (!existing) throw new AppError("Code not found", 404);
  assertOwnership(existing, requesterId);

  const passwordHash =
    typeof password === "string" && password.length > 0
      ? await bcrypt.hash(password, SALT_ROUNDS)
      : null;

  const snippet = await CodeSpace.findOneAndUpdate(
    { id },
    { $set: { passwordHash, lastAccessed: new Date() } },
    { new: true }
  ).lean();

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

export const updateSnippetContent = async (id, { code, language } = {}, password, ownerId = null) => {
  assertValidId(id);

  const existing = await CodeSpace.findOne({ id }).select("+passwordHash").lean();
  if (existing) await assertPasswordAccess(existing, password);

  const set = { lastAccessed: new Date() };
  // An empty editor is never persisted — protects the last saved content
  // from being wiped out by an accidental select-all-delete, a stale/empty
  // client state, etc. Language/lastAccessed still update either way.
  if (typeof code === "string" && code.length > 0) set.code = code;
  if (typeof language === "string" && language.trim()) set.language = language.trim();

  const effectiveOwnerId = existing ? existing.ownerId : ownerId;
  if (!effectiveOwnerId) {
    set.expiresAt = new Date(Date.now() + SNIPPET_TTL_MS);
  }

  const snippet = await CodeSpace.findOneAndUpdate(
    { id },
    { $set: set, $setOnInsert: { id, ownerId } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  return snippet;
};

export const deleteSnippet = async (id, password, requesterId = null) => {
  assertValidId(id);

  const existing = await CodeSpace.findOne({ id }).select("+passwordHash ownerId").lean();
  if (!existing) {
    throw new AppError("Code not found", 404);
  }
  assertOwnership(existing, requesterId);

  // A verified account owner doesn't also need the room's separate password —
  // proven ownership is sufficient. Anonymous rooms (or a non-owner acting on
  // one) still need it.
  const isVerifiedOwner =
    existing.ownerId && requesterId && String(existing.ownerId) === String(requesterId);
  if (!isVerifiedOwner) {
    await assertPasswordAccess(existing, password);
  }

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

// Dashboard data: every snippet owned by a logged-in user, newest edits first,
// with a truncated code preview instead of full content (keeps the list light).
// Excludes rooms that were opened but never actually typed into — joining a
// room creates its DB record immediately (before any content exists), so an
// empty one just means "visited, nothing written," not a real snippet.
export const getUserSnippets = async (ownerId) => {
  const snippets = await CodeSpace.find({ ownerId, code: { $ne: "" } })
    .select("+passwordHash id language code views createdAt updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  return snippets.map((snippet) => ({
    id: snippet.id,
    language: snippet.language,
    preview: snippet.code.slice(0, PREVIEW_LENGTH),
    isProtected: !!snippet.passwordHash,
    views: snippet.views,
    createdAt: snippet.createdAt,
    updatedAt: snippet.updatedAt,
  }));
};
