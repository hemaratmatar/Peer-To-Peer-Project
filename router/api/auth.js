const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const jwtSecret = require("../../utils/jwtSecret");
const auth = require("../../Middleware/auth");

const User = require("../../model/User");

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
//test login after
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

//@router  POST api/auth
//@desc     Authentication user & get Token
//@access   Public

router.post(
  "/",
  [
    check("username", "please include a valid username")
      .not()
      .isEmpty(),
    check(
      "password",
      "please enter a password with 6 or more characters"
    ).exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
      let user = await User.findOne({ username });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Username and Password is wrong" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Username and Password is wrong" }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };
      const token = jwt.sign(payload, jwtSecret(), { expiresIn: 360000 });
      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
