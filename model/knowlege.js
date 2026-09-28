const mongoose = require("mongoose");

const KnowSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    discription: {
        type: String
    },
    status: {
        type: String,
        required: true
    },
    completionStatus: {
        type: String,
        enum: ["ongoing", "completed"],
        default: "ongoing"
    },
    lessons: [{
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        youtubeUrl: {
            type: String,
            default: ""
        },
        order: {
            type: Number,
            required: true
        }
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    sender: {
        uid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
          },
          name: {
            type: mongoose.Schema.Types.String,
            ref: "user"
          }
        },
    resever: {
        uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
        },
        name: {
        type: mongoose.Schema.Types.String,
        ref: "user"
        }
    }
});

module.exports = mongoose.model("knowlege", KnowSchema);
