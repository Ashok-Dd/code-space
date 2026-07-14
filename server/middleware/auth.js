import { verifyToken } from "../services/authService.js";

export const AUTH_COOKIE_NAME = "grabcode_token";

// The client and API are hosted on different domains in production (e.g.
// Vercel + Render), which makes every request cross-site from the cookie's
// perspective. SameSite=Lax cookies are NOT sent on cross-site fetch/XHR/
// socket requests (only top-level navigations), so cross-site deployments
// need SameSite=None — which in turn requires Secure (HTTPS-only), fine in
// production but incompatible with plain http:// local dev.
const isProduction = process.env.NODE_ENV === "production";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, matches the JWT's own expiry
};

// Never blocks the request — just attaches req.userId (string) when a valid
// session cookie is present, or null otherwise. Most routes work for both
// logged-in and anonymous callers.
export const optionalAuth = (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  req.userId = token ? verifyToken(token) : null;
  next();
};

export const requireAuth = (req, res, next) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, message: "Sign in required" });
  }
  next();
};
