#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";

// Load cli/.env regardless of the directory `grabcode` is invoked from
// (it's typically run globally via `npm link`, not from inside cli/).
const packageDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(packageDir, ".env"), quiet: true });

const MAX_PASSWORD_ATTEMPTS = 3;

function printUsage() {
  console.log(`grabcode — pull a snippet from GrabCode into your terminal

Usage:
  grabcode <id>                 Print the snippet's code to stdout
  grabcode <id> -o <file>       Save the code to a file instead
  grabcode <id> -p <password>   Supply a password non-interactively
  grabcode <id> --api <url>     Use a different GrabCode server

Env:
  GRABCODE_API_URL    Server to use (defaults to the public GrabCode server)
  GRABCODE_PASSWORD   Default password, used if -p isn't given

Examples:
  grabcode ashok
  grabcode ashok -o notes.js
  GRABCODE_API_URL=https://api.example.com grabcode ashok
`);
}

function parseArgs(argv) {
  const args = { id: null, api: null, output: null, password: null };
  const rest = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      args.help = true;
    } else if (arg === "-o" || arg === "--output") {
      args.output = argv[++i];
    } else if (arg === "-p" || arg === "--password") {
      args.password = argv[++i];
    } else if (arg === "--api") {
      args.api = argv[++i];
    } else {
      rest.push(arg);
    }
  }

  args.id = rest[0] || null;
  return args;
}

// Raw terminal control bytes, built via charCode to avoid embedding literal
// invisible control characters in the source.
const KEY_ENTER_LF = String.fromCharCode(10); // newline
const KEY_ENTER_CR = String.fromCharCode(13); // carriage return
const KEY_EOF = String.fromCharCode(4); // Ctrl+D
const KEY_INTERRUPT = String.fromCharCode(3); // Ctrl+C
const KEY_BACKSPACE_DEL = String.fromCharCode(127); // DEL, what Backspace sends on most modern terminals
const KEY_BACKSPACE_BS = String.fromCharCode(8); // BS, what Backspace sends on some terminals

// Minimal masked password prompt — no dependencies. Falls back to a clear
// error if stdin isn't an interactive terminal (e.g. piped input in CI).
function promptPassword(question) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(new Error("Password required but stdin isn't interactive — pass -p <password> instead."));
      return;
    }

    process.stdout.write(question);
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let password = "";
    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
    };
    // A single "data" event can carry more than one character — pasted
    // input, fast typing, or programmatic writes can all arrive batched in
    // one chunk — so each chunk must be walked character by character
    // rather than treated as a single keystroke.
    let resolved = false;
    const onData = (chunk) => {
      chunk = chunk.toString();
      for (const char of chunk) {
        if (resolved) return;
        if (char === KEY_ENTER_LF || char === KEY_ENTER_CR || char === KEY_EOF) {
          resolved = true;
          cleanup();
          process.stdout.write("\n");
          resolve(password);
        } else if (char === KEY_INTERRUPT) {
          cleanup();
          process.stdout.write("\n");
          process.exit(130);
        } else if (char === KEY_BACKSPACE_DEL || char === KEY_BACKSPACE_BS) {
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else {
          password += char;
          process.stdout.write("*");
        }
      }
    };

    stdin.on("data", onData);
  });
}

async function fetchSnippet(apiUrl, id, password) {
  const headers = {};
  if (password) headers["X-Snippet-Password"] = password;

  const res = await fetch(`${apiUrl}/${encodeURIComponent(id)}`, { headers });

  if (res.status === 200) {
    return { code: await res.text() };
  }
  if (res.status === 401 || res.status === 403) {
    return { protectedAccess: true, wrongPassword: res.status === 403 };
  }
  if (res.status === 404) {
    throw new Error(`No snippet found at "${id}"`);
  }

  const body = await res.text().catch(() => "");
  throw new Error(`Server returned ${res.status}${body ? `: ${body}` : ""}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.id) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  const DEFAULT_API_URL = "https://code-space-3fzo.onrender.com";
  const apiUrl = (args.api || process.env.GRABCODE_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
  let password = args.password || process.env.GRABCODE_PASSWORD || undefined;

  let attempt = 0;
  for (;;) {
    let result;
    try {
      result = await fetchSnippet(apiUrl, args.id, password);
    } catch (err) {
      console.error(`grabcode: ${err.message}`);
      process.exit(1);
    }

    if (!result.protectedAccess) {
      if (args.output) {
        await writeFile(args.output, result.code, "utf8");
        console.error(`Saved to ${args.output}`);
      } else {
        process.stdout.write(result.code);
        if (!result.code.endsWith("\n")) process.stdout.write("\n");
      }
      return;
    }

    attempt++;
    if (attempt > MAX_PASSWORD_ATTEMPTS) {
      console.error("grabcode: too many incorrect attempts");
      process.exit(1);
    }
    if (result.wrongPassword && password) {
      console.error("Incorrect password.");
    }
    try {
      password = await promptPassword(`Password for "${args.id}": `);
    } catch (err) {
      console.error(`grabcode: ${err.message}`);
      process.exit(1);
    }
  }
}

main();
