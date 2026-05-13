export const randomId = (size = 16) => {
  return crypto.getRandomValues(new Uint32Array(size / 8)).join("");
};
