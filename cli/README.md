# grabcode (CLI)

Pull a GrabCode snippet straight into your terminal — no `curl` needed. If the
snippet is password-protected, you're prompted for the password interactively
(input is masked) instead of the request just failing.

## Setup

```bash
cd cli
npm link          # makes the `grabcode` command available globally
```

Point it at your server by editing `cli/.env` (copy `.env.example` if it
doesn't exist yet) — defaults to `http://localhost:4000`:

```
GRABCODE_API_URL=https://your-server.example.com
```

This is read regardless of which directory you run `grabcode` from. A shell
environment variable of the same name (`export GRABCODE_API_URL=...`) takes
priority over `.env` if you need a one-off override.

## Usage

```bash
grabcode ashok                 # print the snippet at id "ashok" to stdout
grabcode ashok -o notes.js     # save it to a file instead
grabcode ashok -p mypassword   # pass a password non-interactively (e.g. in scripts)
```

If the room is password-protected and no `-p`/`GRABCODE_PASSWORD` is given,
you'll be prompted:

```
Password for "ashok":
```

Input is masked as you type. Up to 3 attempts before it gives up.
