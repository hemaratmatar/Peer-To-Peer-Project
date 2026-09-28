const mongoose = require("mongoose");

const resevSchema = new mongoose.Schema({
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    name: {
        type: mongoose.Schema.Types.String,
        ref: "user"
    },
    title:{
        type: mongoose.Schema.Types.String,
        ref: "knowlege"
    },
    discription:{
        type: mongoose.Schema.Types.String,
        ref: "knowlege"
    }
});

module.exports = mongoose.model("resever", resevSchema);
