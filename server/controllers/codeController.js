import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getSnippet,
  updateSnippetContent,
  deleteSnippet,
  getSnippetStats,
} from "../services/codeService.js";

const passwordFromRequest = (req) => req.get("X-Snippet-Password") || undefined;

// Raw plain-text access, e.g. `curl <api>/:id` — 404s if the room was never
// opened/created (does not lazily create, unlike joining the editor over a socket).
// If the snippet is password-protected, pass it via the X-Snippet-Password header.
export const getCode = asyncHandler(async (req, res) => {
  const snippet = await getSnippet(req.params.id, passwordFromRequest(req));
  res.status(200).type('text/plain').send(snippet.code);
});

// Upserts a snippet's content — REST fallback for non-socket/programmatic clients.
export const updateCode = asyncHandler(async (req, res) => {
  const { code, language } = req.body;

  if (typeof code !== "string") {
    return res.status(400).json({ success: false, message: "Code is required" });
  }

  const snippet = await updateSnippetContent(
    req.params.id,
    { code, language },
    passwordFromRequest(req)
  );

  res.status(200).json({
    success: true,
    message: "Code updated successfully",
    data: {
      id: snippet.id,
      language: snippet.language,
      updatedAt: snippet.updatedAt,
    },
  });
});

export const deleteCode = asyncHandler(async (req, res) => {
  await deleteSnippet(req.params.id, passwordFromRequest(req));

  res.status(200).json({
    success: true,
    message: "Code deleted successfully",
  });
});

export const getCodeStats = asyncHandler(async (req, res) => {
  const snippet = await getSnippetStats(req.params.id);

  res.status(200).json({
    success: true,
    data: snippet,
  });
});
