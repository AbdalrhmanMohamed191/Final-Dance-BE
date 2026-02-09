const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../uploads/uploads");
const User = require("../model/user");
// const User = require("../model/User");
const router = express.Router();

router.put("/profile/update", authMiddleware , upload.single("image") , async (req, res) => {
    try {
        // get user Id
        const userId = req.user.id;
        // get user
        const user = await User.findById(userId);
        // Get Image
        const profileImage = req.file.path;
        user.profileImage = profileImage;
        // save user
        await user.save();
        res.status(200).json({message : "Profile Updated Successfully" , profileImage : profileImage});


       
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;