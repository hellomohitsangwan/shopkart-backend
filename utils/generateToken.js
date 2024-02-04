const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, "prochess_mohit", {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
