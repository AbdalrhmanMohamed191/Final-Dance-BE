const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // اللي الإشعار رايح له
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // اللي عمل اللايك / الكومنت / الفولو
    },

    type: {
      type: String,
      enum: ["like", "comment", "follow"],
      required: true,
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);