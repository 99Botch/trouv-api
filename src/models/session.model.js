//Se référer au model user
const mongoose = require("mongoose");

const schema = mongoose.Schema({
	user_id: {
        type: "ObjectId",
        required: true,
    },
    token: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("Session", schema);