const { text } = require("express");
const joi = require("joi");

const createCommentSchema = joi.object({
    postId: joi.string().required(),
    text: joi.string().min(1).max(500).required(),
});



module.exports = { createCommentSchema };