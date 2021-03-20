const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route   POST api/users
// @desc    register User
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),

    check('email', 'Please Include a Valid Email').isEmail(),

    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //console.log(req.body);

    const { name, email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exsists' }] });
      }

      // Get Uses gravatar
      const avatar = gravatar.url(email, {
        s: '200', //size of gravatar
        r: 'pg', //rating
        d: 'mm' //it gives a a default image like a user icon
      });

      //creates an instance of a user
      user = new User({
        name,
        email,
        avatar,
        password
      });

      //encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();
      //return json web token

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
