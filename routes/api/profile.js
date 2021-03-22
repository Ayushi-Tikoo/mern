const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {
  check,
  validationResult
} = require('express-validator/check');

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
      return res.status(400).json({
        msg: 'There is no profile for this user'
      });
    }
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/profile
// @desc    create or update users profile
// @access  Private

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required')
      .not()
      .isEmpty(),
      check('skills', 'Skills is required')
      .not()
      .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    //Pulling all the fields from req.body
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //Build profile object
    const profilefields = {};
    profilefields.user = req.user.id;
    if (company) profilefields.company = company;
    if (website) profilefields.website = website;
    if (location) profilefields.location = location;
    if (bio) profilefields.bio = bio;
    if (status) profilefields.status = status;
    if (githubusername) profilefields.githubusername = githubusername;
    if (skills) {
      profilefields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build Social object
    profilefields.social = {};
    if (youtube) profilefields.social.youtube = youtube;
    if (facebook) profilefields.social.facebook = facebook;
    if (twitter) profilefields.social.twitter = twitter;
    if (instagram) profilefields.social.instagram = instagram;
    if (linkedin) profilefields.social.linkedin = linkedin;

    try {
      //whenever we write a mongoose method we write await in front of it as it returns a promise
      let profile = await Profile.findOne({
        user: req.user.id
      });

      //if profile is found update it
      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate({
          user: req.user.id
        }, {
          $set: profilefields
        }, {
          new: true
        });
        return res.json(profile);
      }

      // if profile is not found Create the profile
      profile = new Profile(profilefields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);
// @route   GET api/profile
// @desc    get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
})


module.exports = router;