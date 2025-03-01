const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // Expected format: "Bearer <token>"
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user; // contains the identifier from token payload
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
