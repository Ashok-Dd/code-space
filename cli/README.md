# grabcode

Pull a GrabCode snippet straight into your terminal — no `curl` needed. If the
snippet is password-protected, you're prompted for the password interactively
(input is masked) instead of the request just failing.

## Install

```bash
npm install -g grabcode
```

That's it — no server setup, no config. It talks to the public GrabCode
server by default.

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

## Pointing at a different server

Only needed if you're running your own GrabCode instance (e.g. local dev):

```bash
grabcode ashok --api http://localhost:4000
# or
export GRABCODE_API_URL=http://localhost:4000
```

A `GRABCODE_API_URL` in a `.env` file next to this package works too (see
`.env.example`) — a real shell environment variable takes priority over it,
and `--api` takes priority over both.

## Developing on this package

```bash
cd cli
npm install
npm link      # makes `grabcode` point at your local checkout instead
```
