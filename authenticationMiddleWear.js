// authMiddleware.js
const jwt = require('jsonwebtoken');

function verifyUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, 'abc');
    req.user = decoded; // store decoded info in req.user
    next(); // continue to route
  } catch (err) {
    return res.status(401).send("Unauthorized: Invalid Token");
  }
}

module.exports = verifyUser;
