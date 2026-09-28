const express = require("express");
const router = express.Router();
const Know = require("../../model/knowlege");
const auth = require("../../Middleware/auth");

// Courses the current user teaches
router.get("/", auth, async (req, res) => {
    try {
        const courses = await Know.find({ "sender.uid": req.user.id })
            .select("title discription status")
            .sort({ _id: -1 });
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
