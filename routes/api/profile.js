const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private

//we get the profile according to the id passed in the api
//first we need to verify the token then only we can proceed so we
//use the auth middleware to check the token
router.get('/me', auth, async (req, res) => {
  try {
    //we send the id(user.req.id) which we get from the middleware to the user object in the profile
    //populte tells what property on user document we want to work with
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
