// models/Story.js
const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => Date.now() + 24*60*60*1000 }, // 24 ساعة
  seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // seen by users
});

module.exports = mongoose.model("Story", storySchema);