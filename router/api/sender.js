const express = require("express");
const router = express.Router();
const Sender = require("../../model/Sender");
const auth = require("../../Middleware/auth");
const User = require("../../model/User");
const Know = require("../../model/knowlege");

router.get("/" ,auth, async (req,res)=>{
    try {
        const user = await User.findById(req.user.id).select("-password");
        const sender = await Sender.find({uid: user.id});
        if(!sender) return res.status(400).json({ msg: "Sender not Found" });
        res.json(sender);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
router.get("/:id",async (req,res)=>{
    try {
        const send = await Sender.findById(req.params.id);
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !send) {
            return res.status(404).json({ msg: "Sender not found" });
          }
          res.json(send);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})

router.post("/app",auth,async (req,res)=>{
    const {title,discription} = req.body;
    const kn = {status:"true"};

    try {
        const know  = await Know.findOneAndUpdate({title:title,discription:discription},{$set:kn},{new:true});
        const send = await Sender.findOneAndUpdate({title:title,discription:discription},{$set:kn},{new:true})
        res.json({ sender: send, course: know });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})
module.exports = router;
