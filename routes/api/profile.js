const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator/check');
const request = require('request');
const config = require('config');

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
    return res.status(500).send('Server Error');
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
        profile = await Profile.findOneAndUpdate(
          {
            user: req.user.id
          },
          {
            $set: profilefields
          },
          {
            new: true
          }
        );
        return res.json(profile);
      }

      // if profile is not found Create the profile
      profile = new Profile(profilefields);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);
// @route   GET api/profile
// @desc    get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    return res.json(profiles);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    get profile by user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    return res.json(profile);
  } catch (err) {
    console.log(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    return res.status(500).send('Server Error');
  }
});

// @route   DELETE api/profile
// @desc    Delete profile users and post
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    //Remove users post

    //Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //Remove User
    await User.findOneAndRemove({ _id: req.user.id });
    return res.json({ msg: 'User deleted' });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send('Server Error');
  }
});
// @route   PUT api/profile/experience
// @desc    Add profile experience by updating the profile of user
// @access  Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'From Date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(404).json({ error: error.array() });
    }
    //Object Destructuring
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      //we have this id feild from the token
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(404).send({ msg: 'Profile not present' });
      }
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete Experience of profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).send({ msg: 'Profile not present' });
    }
    //Get remove index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);
    console.log(removeIndex);
    if (removeIndex < 0) {
      return res.status(404).send({
        msg: 'Experience corresponding to the profile is not present'
      });
    }

    //splice(positionNumber,no of items to be removed)
    profile.experience.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);

    return res.json({ msg: 'Profile Experience deleted' });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send('Server Error');
  }
});
// @route   PUT api/profile/education
// @desc    Add profile education by updating the profile of user
// @access  Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('fieldofstudy', 'Field of Study Date is required')
        .not()
        .isEmpty(),
      check('from', 'From Date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(404).json({ error: error.array() });
    }
    //Object Destructuring
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      //we have this id feild from the token
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(404).send({ msg: 'Profile not present' });
      }
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education of profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).send({ msg: 'Profile not present' });
    }
    //Get remove index
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);
    console.log(removeIndex);
    if (removeIndex < 0) {
      return res.status(404).send({
        msg: 'Education corresponding to the profile is not present'
      });
    }

    //splice(positionNumber,no of items to be removed)
    profile.education.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);

    return res.json({ msg: 'Profile Education deleted' });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send('Server Error');
  }
});
// @route   GET api/profile/github/:username
// @desc    Get user repos from github
// @access  Private
router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };
    request(options, (error, response, body) => {
      if (error) console.log(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No github profile found' });
      }
      return res.json(JSON.parse(body));
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
