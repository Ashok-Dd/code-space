const isPlainObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Recursively strips keys that look like Mongo query operators ($ne, $gt, ...)
// or contain dots, so a JSON body can't be used to inject query operators
// into a findOneAndUpdate/findOne filter built from user input.
const stripMongoOperators = (value) => {
  if (Array.isArray(value)) {
    value.forEach(stripMongoOperators);
    return value;
  }
  if (!isPlainObject(value)) return value;

  for (const key of Object.keys(value)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete value[key];
      continue;
    }
    stripMongoOperators(value[key]);
  }
  return value;
};

// express-mongo-sanitize also tries to rewrite req.query/req.params, but
// Express 5 made req.query a read-only getter and route params are always
// plain strings anyway — req.body is the only mutable, attacker-shaped input here.
export const sanitizeBody = (req, res, next) => {
  if (req.body) stripMongoOperators(req.body);
  next();
};
