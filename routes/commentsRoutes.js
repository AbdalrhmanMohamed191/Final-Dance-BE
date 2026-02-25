const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const Comment = require("../model/Comment");
const { createCommentSchema } = require("../validation/commentValidator");

const router = express.Router();

// internal imports

router.post("", authMiddleware  ,async (req, res) => {
    try {
        // prepare the data
        const userId = req.user.id;
        const data = req.body;

        // validate the data

        const { error , value } = createCommentSchema.validate(data , { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: error.details.map((err) => err.message) });
        }

        const { postId , text , parentComment } = value;
        // create the comment
        const newcomment = await Comment.create({ userId : req.user.id,postId,text, parentComment });
        const comment =   await Comment.findById(newcomment._id).populate("userId" , "username profileImage");

        res.status(201).json({ message: "Comment created successfully", comment });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }

});

// get All Reply of a comment
router.get("/replies/:commentId" , async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const replies = await Comment.find({ parentComment: commentId }).populate("userId" , "username profileImage").sort({ createdAt: -1 });
        res.status(200).json({ message: "Replies fetched successfully", replies });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }
});

// update comment
router.patch("/:id" , authMiddleware , async (req, res) => {
try {
    // prepare the data
    const id = req.params.id;
    const userId = req.user.id;
    const text = req.body.text;

    // update the comment
    const comment = await Comment.findOneAndUpdate(
        { _id: id, userId },
        { text },
        { new: true }
    ).populate("userId" , "username profileImage");
    if (!comment) {
        return res.status(403).json({ message: "You are not authorized to update this comment" });
    }
    res.status(200).json({ message: "Comment updated successfully", comment });
} catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
}
});

// delete comment
router.delete("/:id" , authMiddleware , async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const comment = await Comment.findOneAndDelete({ _id: id, userId });
        if (!comment) {
            return res.status(403).json({ message: "You are not authorized to delete this comment" });
        }
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }
});
module.exports = router;