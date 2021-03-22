const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');

const { check, validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route   GET api/auth
// @desc    Test route
// @access  Public

//first the middleware auth runs then the response is given
//in the middleware if the token is found valid then it goes further
//if the token is found valid then the user details are shown by id

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth
// @desc    authenticate user and get token
// @access  Public

//Login of a user

router.post(
  '/',
  //this is a middleware to check the email and password
  [
    check('email', 'Please Include a Valid Email').isEmail(),

    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //console.log(req.body);

    const { email, password } = req.body;

    try {
      // See if user exists
      // we get the user from the database
      let user = await User.findOne({ email });

      //if user is not found then error
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      //then match password if the email is valid
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const payload = {
        user: {
          id: user.id //id of the user which is getting saved
        }
      };

      //signing by passing the payload, jwt secret ,expiration
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      //res.send('User registered');
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
