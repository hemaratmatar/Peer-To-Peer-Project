const express = require("express");
const router = express.Router();
const Know = require("../../model/knowlege");
const auth = require("../../Middleware/auth");

// Published courses the current user is enrolled in
router.get("/", auth, async (req, res) => {
    try {
        const courses = await Know.find({ students: req.user.id, status: "true" })
            .select("title discription")
            .sort({ _id: -1 });
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
