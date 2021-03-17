const jwt = require('jsonwebtoken');
const config = require('config');

//middleware has access to req, res and next
module.exports = function(req, res, next) {
  //get token form the header
  const token = req.header('x-auth-token');

  //check if token is valid or not
  if (!token) {
    return res.status(401).json({ msg: 'No token found Authorization denied' });
  }

  //verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    //we get the user from the decoded token and then we can use it in any of the routes
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
