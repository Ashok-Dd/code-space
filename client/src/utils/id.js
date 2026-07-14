const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const generateRandomId = () => {
  const length = 8;
  let id = "";
  for (let i = 0; i < length; i++) {
    id += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return id;
};
