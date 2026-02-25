const { text } = require("express");
const joi = require("joi");

const createCommentSchema = joi.object({
    postId: joi.string().required(),
    text: joi.string().min(1).max(500).required(),
    parentComment: joi.string().optional().allow(null, ''), // إذا كان التعليق ردًا على تعليق آخر، يمكن أن يكون parentComment معرف التعليق الأب أو null
});



module.exports = { createCommentSchema };