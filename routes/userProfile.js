const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../uploads/uploads");
const User = require("../model/user");
const { updateProfileSchema } = require("../validation/userValidator");
const Post = require("../model/Posts");
const router = express.Router();

// UPDATE PROFILE IMAGE
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

// UPDATE USER PROFILE
// router.patch("/profile/update", authMiddleware , async (req, res) => {
//     try {
//         const data = req.body; 

//         const {value , error} = updateProfileSchema.validate(data , {abortEarly : false});

//         if (error) {
//             return res.status(400).json({message : error.details.map((err) => err.message)});
//         }
//         const userId = req.user.id;
//         const {bio , name} = value;
       
//         const user = await User.findByIdAndUpdate(userId, value, { new: true }).select("-password");
        
//         res.status(200).json({message : "Profile Updated Successfully" , bio : bio , name : name});
//     } catch (err) {
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// });

router.patch("/profile/update", authMiddleware , async (req, res) => {
  try {
    const data = req.body; 

    const { value, error } = updateProfileSchema.validate(data, { abortEarly: false });

    if (error) {
      return res.status(400).json({ message: error.details.map((err) => err.message) });
    }

    const userId = req.user.id;
    const { bio, name } = value;

    // تحديث البيانات وإرجاع النسخة الجديدة
    const user = await User.findByIdAndUpdate(
      userId,
      { bio, username: name }, // تأكد من اسم الحقل في الـ DB
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile Updated Successfully",
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage, // لو عايز ترجّع صورة البروفايل برضه
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


// GET USER POSTS
router.get("/:userId/posts"  , async (req, res) => {
    try {
        const userId = req.params.userId;
        const posts = await Post.find({ userId }).sort({ createdAt: -1 });
        res.json({posts});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }    
});

module.exports = router;