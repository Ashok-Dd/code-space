import { parseCookie } from "cookie";
import {
  getOrCreateSnippet,
  updateSnippetContent,
  setSnippetPassword,
  isPasswordCorrect,
  isValidId,
} from "../services/codeService.js";
import { verifyToken } from "../services/authService.js";
import { AUTH_COOKIE_NAME } from "../middleware/auth.js";

const UPDATE_THROTTLE_MS = 300;
const MAX_CODE_LENGTH = 100000;
const MAX_FAILED_PASSWORD_ATTEMPTS = 10;

// Per-socket throttle/attempt state, cleared on disconnect.
const lastUpdateAtBySocket = new Map();
const failedPasswordAttemptsBySocket = new Map();

const roomViewerCount = (io, roomId) => io.sockets.adapter.rooms.get(roomId)?.size || 0;

const broadcastViewers = (io, roomId) => {
  io.to(roomId).emit("viewers", roomViewerCount(io, roomId));
};

// The auth cookie travels with the Socket.IO handshake (client connects with
// withCredentials: true) the same way it does with a normal fetch — no
// separate login step needed for the socket connection itself.
const getUserIdFromSocket = (socket) => {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) return null;
  const token = parseCookie(cookieHeader)[AUTH_COOKIE_NAME];
  return token ? verifyToken(token) : null;
};

export const registerCodeSocket = (io) => {
  io.on("connection", (socket) => {
    let currentRoomId = null;
    const userId = getUserIdFromSocket(socket);

    socket.on("join", async (payload, ack) => {
      const rawId = typeof payload === "string" ? payload : payload?.id;
      const password = typeof payload === "object" && payload ? payload.password : undefined;
      const id = typeof rawId === "string" ? rawId.trim() : "";

      if (!isValidId(id)) {
        socket.emit("join-error", "Invalid id");
        if (typeof ack === "function") ack({ ok: false });
        return;
      }

      const failedAttempts = failedPasswordAttemptsBySocket.get(socket.id) || 0;
      if (failedAttempts >= MAX_FAILED_PASSWORD_ATTEMPTS) {
        socket.emit("protected", { wrongPassword: true, throttled: true });
        if (typeof ack === "function") ack({ ok: true, protected: true });
        return;
      }

      try {
        const snippet = await getOrCreateSnippet(id, userId);
        const roomIsProtected = !!snippet.passwordHash;
        const authorized = await isPasswordCorrect(snippet, password);

        if (roomIsProtected && !authorized) {
          if (password) {
            failedPasswordAttemptsBySocket.set(socket.id, failedAttempts + 1);
          }
          socket.emit("protected", { wrongPassword: !!password });
          if (typeof ack === "function") ack({ ok: true, protected: true });
          return;
        }

        failedPasswordAttemptsBySocket.delete(socket.id);
        if (currentRoomId) socket.leave(currentRoomId);
        currentRoomId = id;
        socket.join(id);

        socket.emit("init", {
          code: snippet.code,
          language: snippet.language,
          viewers: roomViewerCount(io, id),
          isProtected: roomIsProtected,
          isOwner: !!snippet.ownerId && String(snippet.ownerId) === String(userId),
        });
        broadcastViewers(io, id);
        if (typeof ack === "function") ack({ ok: true });
      } catch (err) {
        socket.emit("join-error", err.message || "Unable to join room");
        if (typeof ack === "function") ack({ ok: false });
      }
    });

    socket.on("code-update", async ({ id, code, language } = {}) => {
      if (!currentRoomId || id !== currentRoomId) return;
      if (typeof code !== "string" || code.length > MAX_CODE_LENGTH) return;

      const now = Date.now();
      const last = lastUpdateAtBySocket.get(socket.id) || 0;
      if (now - last < UPDATE_THROTTLE_MS) return;
      lastUpdateAtBySocket.set(socket.id, now);

      try {
        const snippet = await updateSnippetContent(id, { code, language }, undefined, userId);
        socket.to(id).emit("code-update", {
          code: snippet.code,
          language: snippet.language,
        });
      } catch (err) {
        socket.emit("save-error", err.message || "Unable to save changes");
      }
    });

    // Only a socket that has already successfully joined (i.e. proven it
    // knows the current password, if any) may set/change/remove one — and if
    // the room is owned, only the owner.
    socket.on("set-password", async ({ id, password } = {}, ack) => {
      if (!currentRoomId || id !== currentRoomId) {
        if (typeof ack === "function") {
          ack({ ok: false, message: "Open the room before changing its password" });
        }
        return;
      }

      try {
        const { isProtected } = await setSnippetPassword(id, password, userId);
        io.to(id).emit("protection-changed", { isProtected });
        if (typeof ack === "function") ack({ ok: true, isProtected });
      } catch (err) {
        if (typeof ack === "function") {
          ack({ ok: false, message: err.message || "Unable to update password" });
        }
      }
    });

    socket.on("disconnect", () => {
      lastUpdateAtBySocket.delete(socket.id);
      failedPasswordAttemptsBySocket.delete(socket.id);
      // socket.io removes the socket from its rooms before emitting "disconnect",
      // so the viewer count below already excludes it.
      if (currentRoomId) broadcastViewers(io, currentRoomId);
    });
  });
};
