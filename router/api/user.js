const express = require('express');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const { check, validationResult } = require('express-validator');
const auth = require('../../Middleware/auth');
const admin = require('../../Middleware/admin');
const User = require('../../model/User');
const Know = require('../../model/knowlege');
const { isValidId } = require('../../utils/validation');

const router = express.Router();

const validateUser = [
  check('name', 'Name is required').not().isEmpty(),
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password must contain at least 6 characters').optional({ checkFalsy: true }).isLength({ min: 6 }),
  check('uid', 'User ID is required').not().isEmpty(),
  check('role', 'Role is invalid').isIn(['admin', 'instructor', 'user'])
];

router.post('/', auth, admin, validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, username, password, uid, role } = req.body;
  const accountPassword = password || `${randomBytes(12).toString('base64url')}Aa1!`;

  try {
    if (await User.findOne({ username })) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    const user = new User({ name, username, password: accountPassword, uid, role });
    user.password = await bcrypt.hash(accountPassword, await bcrypt.genSalt(10));
    await user.save();

    res.status(201).json({
      user: { id: user.id, name, username, uid, role },
      credentials: { username, password: accountPassword }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const viewer = await User.findById(req.user.id).select('role');
    if (!viewer || !['admin', 'instructor'].includes(viewer.role)) {
      return res.status(403).json({ msg: 'Course management access required' });
    }

    const query = viewer.role === 'admin' ? {} : { role: 'user' };
    const users = await User.find(query).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, admin, validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  if (!isValidId(req.params.id)) return res.status(404).json({ msg: 'User not found' });

  const { name, username, uid, role, password } = req.body;
  if (req.params.id === req.user.id && role !== 'admin') {
    return res.status(400).json({ msg: 'You cannot remove your own admin role' });
  }

  try {
    const duplicate = await User.findOne({ username, _id: { $ne: req.params.id } });
    if (duplicate) return res.status(400).json({ msg: 'Username already exists' });

    const update = { name, username, uid, role };
    if (password) update.password = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, admin, async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ msg: 'You cannot delete your own account' });
  }

  if (!isValidId(req.params.id)) return res.status(404).json({ msg: 'User not found' });

  try {
    if (await Know.exists({ 'sender.uid': req.params.id })) {
      return res.status(400).json({ msg: 'Reassign this user\'s courses to another instructor before deleting' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    await Know.updateMany({ students: user._id }, { $pull: { students: user._id } });
    res.json({ id: user.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
