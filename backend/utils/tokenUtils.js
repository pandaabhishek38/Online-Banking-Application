const jwt = require("jsonwebtoken");

const RESET_SECRET = process.env.RESET_SECRET;

function generateResetToken(email) {
  return jwt.sign({ email }, RESET_SECRET, { expiresIn: "10m" });
}

function verifyResetToken(token) {
  try {
    return jwt.verify(token, RESET_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  generateResetToken,
  verifyResetToken,
};
