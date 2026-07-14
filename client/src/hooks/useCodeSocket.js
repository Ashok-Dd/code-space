import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { API_URL } from "../config";

const AUTOSAVE_DELAY_MS = 800;
const SAVED_BADGE_MS = 1500;

const passwordCacheKey = (roomId) => `codespace:pw:${roomId}`;

// Owns the socket lifecycle for a single room: joining (optionally behind a
// password), receiving live updates from other clients, and
// debounced-autosaving local edits.
export function useCodeSocket(roomId) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [status, setStatus] = useState("connecting"); // connecting | live | saving | saved | offline
  const [viewers, setViewers] = useState(0);
  const [ready, setReady] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [locked, setLocked] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const socketRef = useRef(null);
  const saveTimerRef = useRef(null);
  const savedBadgeTimerRef = useRef(null);
  const latestRef = useRef({ code: "", language: "plaintext" });
  const dirtyRef = useRef(false); // true while there's an edit not yet sent to the server
  const lastAttemptedPasswordRef = useRef(undefined);
  const isManualAttemptRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    setReady(false);
    setNotFound(false);
    setLocked(false);
    setIsProtected(false);
    setPasswordError("");
    setStatus("connecting");
    dirtyRef.current = false;

    const socket = io(API_URL, { transports: ["websocket", "polling"], withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connecting");
      const cached = sessionStorage.getItem(passwordCacheKey(roomId)) || undefined;
      isManualAttemptRef.current = false;
      lastAttemptedPasswordRef.current = cached;
      socket.emit("join", { id: roomId, password: cached }, (ack) => {
        if (!ack?.ok) setNotFound(true);
      });
    });

    socket.on("init", (payload) => {
      const nextCode = payload.code || "";
      const nextLanguage = payload.language || "plaintext";
      latestRef.current = { code: nextCode, language: nextLanguage };
      setCode(nextCode);
      setLanguage(nextLanguage);
      setViewers(payload.viewers || 1);
      setIsProtected(!!payload.isProtected);
      setIsOwner(!!payload.isOwner);
      setLocked(false);
      setPasswordError("");
      setReady(true);
      setStatus("live");

      if (payload.isProtected && lastAttemptedPasswordRef.current) {
        sessionStorage.setItem(passwordCacheKey(roomId), lastAttemptedPasswordRef.current);
      }
    });

    socket.on("protected", ({ wrongPassword, throttled } = {}) => {
      setIsProtected(true);
      setLocked(true);
      setReady(false);
      if (throttled) {
        setPasswordError("Too many attempts — wait a moment and try again.");
      } else if (wrongPassword) {
        sessionStorage.removeItem(passwordCacheKey(roomId));
        if (isManualAttemptRef.current) setPasswordError("Incorrect password");
      }
    });

    socket.on("protection-changed", ({ isProtected: nextIsProtected }) => {
      setIsProtected(nextIsProtected);
      if (!nextIsProtected) sessionStorage.removeItem(passwordCacheKey(roomId));
    });

    socket.on("code-update", (payload) => {
      latestRef.current = { code: payload.code, language: payload.language };
      setCode(payload.code);
      setLanguage(payload.language);
    });

    socket.on("viewers", (count) => setViewers(count));
    socket.on("join-error", () => setNotFound(true));
    socket.on("save-error", (message) => toast.error(message || "Couldn't save your changes"));
    socket.on("disconnect", () => setStatus("offline"));
    socket.on("connect_error", () => setStatus("offline"));

    return () => {
      clearTimeout(saveTimerRef.current);
      clearTimeout(savedBadgeTimerRef.current);
      // Flush a pending debounced edit instead of dropping it on the floor
      // (e.g. user types then immediately clicks "New Snippet").
      if (dirtyRef.current && socket.connected) {
        socket.emit("code-update", { id: roomId, ...latestRef.current });
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const scheduleSave = useCallback((nextCode, nextLanguage) => {
    latestRef.current = { code: nextCode, language: nextLanguage };
    dirtyRef.current = true;
    setStatus("saving");
    clearTimeout(saveTimerRef.current);
    clearTimeout(savedBadgeTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      const socket = socketRef.current;
      dirtyRef.current = false;
      if (!socket || !socket.connected) return;

      socket.emit("code-update", { id: roomId, ...latestRef.current });
      setStatus("saved");
      savedBadgeTimerRef.current = setTimeout(() => {
        setStatus((current) => (current === "saved" ? "live" : current));
      }, SAVED_BADGE_MS);
    }, AUTOSAVE_DELAY_MS);
  }, [roomId]);

  const updateCode = useCallback((value) => {
    setCode(value);
    scheduleSave(value, latestRef.current.language);
  }, [scheduleSave]);

  const updateLanguage = useCallback((value) => {
    setLanguage(value);
    scheduleSave(latestRef.current.code, value);
  }, [scheduleSave]);

  const unlock = useCallback((password) => {
    const socket = socketRef.current;
    if (!socket) return;
    isManualAttemptRef.current = true;
    lastAttemptedPasswordRef.current = password;
    setPasswordError("");
    socket.emit("join", { id: roomId, password }, (ack) => {
      if (!ack?.ok) setNotFound(true);
    });
  }, [roomId]);

  const setPassword = useCallback((password) => {
    const socket = socketRef.current;
    if (!socket) return Promise.reject(new Error("Not connected"));

    return new Promise((resolve, reject) => {
      socket.emit("set-password", { id: roomId, password }, (ack) => {
        if (!ack?.ok) {
          reject(new Error(ack?.message || "Unable to update password"));
          return;
        }
        if (password) {
          sessionStorage.setItem(passwordCacheKey(roomId), password);
        } else {
          sessionStorage.removeItem(passwordCacheKey(roomId));
        }
        setIsProtected(ack.isProtected);
        resolve(ack);
      });
    });
  }, [roomId]);

  return {
    code,
    language,
    status,
    viewers,
    ready,
    notFound,
    locked,
    isProtected,
    isOwner,
    passwordError,
    updateCode,
    updateLanguage,
    unlock,
    setPassword,
  };
}
