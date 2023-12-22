const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  pic: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  caption: String, // Changed to lowercase "caption"
  date: {
    type: Date, // Using JavaScript's Date object
    default: Date.now
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  comments: [{ // Added a field for comments
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment"
  }]
});

module.exports = mongoose.model("post", postSchema);
