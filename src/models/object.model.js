const mongoose = require("mongoose");

const schema = mongoose.Schema({
  addedBy: {
    type: String,
    required: true,
  },
  object: {
    type: String,
    required: true,
    maxLength: 120,
  },
  details: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
  },
  where: {
    type: String,
    required: true,
  },
  when: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  pattern: {
    type: String,
    required: true
  },
  colours: {
    type: [String],
    required: true,
    //je m'assure que l'array contienne à minima une valeur et que
    //l'attribut contienne un array
    validate: (v) => Array.isArray(v) && v.length > 0,
  },
});

module.exports = mongoose.model("Object", schema);
