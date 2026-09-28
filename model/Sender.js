const mongoose = require("mongoose");

const senderSchema = new mongoose.Schema({
  uidresev: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  name: {
    type: mongoose.Schema.Types.String,
    ref: "user"
  },
  title: {
    type: mongoose.Schema.Types.String,
    ref: "knowlege"
  },
  discription: {
    type: mongoose.Schema.Types.String,
    ref: "knowlege"
  },
  status: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("sender", senderSchema);
