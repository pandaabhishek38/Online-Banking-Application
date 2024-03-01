const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
//   console.log(req.headers)
  const token = req.headers['authorization'].split(' ')[1];
//   console.log(token)

  if (!token) {
    return res.redirect('/error'); // Redirect to error page if token is missing
  }

  jwt.verify(token, 'enc_key', (err, decoded) => {
    if (err) {
      return res.redirect('/error'); // Redirect to error page if token is invalid
    }

    // Attach user ID to request object
    req.customerId = decoded.Customer_Id;
    next();
  });
}

module.exports = authenticateToken;

