const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true 
  },
  author: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ["novel", "education", "science", "religion", "kids", "other"],
    default: "other"
  },
  condition: {
    type: String,
    enum: ["new", "good", "old"],
    required: true
  },
  image: {
    type: String,  // path أو URL
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  inStock: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);
