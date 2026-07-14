import { asyncHandler } from "../utils/asyncHandler.js";
import { signup, login, getUserById } from "../services/authService.js";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "../middleware/auth.js";

export const signupHandler = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const { user, token } = await signup({ username, email, password });

  res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
  res.status(201).json({ success: true, data: user });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const { user, token } = await login({ identifier, password });

  res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
  res.status(200).json({ success: true, data: user });
});

export const logoutHandler = (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { ...AUTH_COOKIE_OPTIONS, maxAge: undefined });
  res.status(200).json({ success: true });
};

export const meHandler = asyncHandler(async (req, res) => {
  const user = await getUserById(req.userId);
  if (!user) {
    res.clearCookie(AUTH_COOKIE_NAME, { ...AUTH_COOKIE_OPTIONS, maxAge: undefined });
    return res.status(401).json({ success: false, message: "Sign in required" });
  }
  res.status(200).json({ success: true, data: user });
});
