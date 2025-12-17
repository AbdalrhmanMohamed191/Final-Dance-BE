// IMPORTS
const express = require("express");
const Book = require("../model/Book");
const router = express.Router();

// IMPORT MIDDLEWARE
const { authMiddleware } = require("../middleware/authMiddleware");
const { createBookSchema  , updateBookSchema} = require("../validation/bookValidate");
const { roleMiddleware } = require("../middleware/roleMiddleware");

// Create Book
router.post("/create" , authMiddleware , async (req, res)  => {
  try {
      // VALIDATION
    const {error , value} = createBookSchema.validate(req.body);
      if (error) {
          return res.status(400).json({message : error.message});
     }
        
    const { title, author, description, price, category, condition, image, inStock} = value;

    // CHECK IF BOOK EXISTS
    const bookExists = await Book.findOne({ title });
    if (bookExists) {
      return res.status(400).json({ message: "Book Already Exists" });
    }

    // CREATE BOOK
    const book = await Book.create({
      title,
      author,
      description,
      price,
      category,
      condition,
      image,
      inStock,
      owner: req.user.id
    });

    // POPULATE USER
    const populatedBook = await Book.findById(book._id).populate("owner", "email role");
    res.status(201).json({ success: true, message: "Book Created Successfully" , book : populatedBook});
    
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, message: "Internal Server Error" });
    
  }
}
);

// Get All Books + Search + Filters
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().populate("owner");

    if (!books) return res.status(404).json({ message: "No Books Found" });

    res.status(200).json({ message: "All Books Fetched Successfully", books });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get Single Book
router.get("/:id" , async (req, res) => {
  try {
    const book = await Book.findById(id).populate("owner", "email role");

    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json({ success: true, book });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Update Book (owner only)
router.put("/:id", authMiddleware , async (req, res) => {
  try {
    const {error , value} = updateBookSchema.validate(req.body);
    if (error) {
        return res.status(400).json({message : error.message});

    }
    const { title, author, description, price, category, condition, image, inStock} = value;

    const book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ message: "Book not found" });
    // Update Book
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        description,
        price,
        category,
        condition,
        image,
        inStock,
      },
      { new: true }
    );

    if (!updatedBook) return res.status(404).json({ message: "Book not found" });

    res.status(200).json({ success: true, message: "Book Updated Successfully" , book : updatedBook});
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Delete Book (owner only)
router.delete("/:id", authMiddleware , async (req, res) => {
  try {
    // CHECK IF BOOK EXISTS
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // DELETE BOOK
    await Book.findByIdAndDelete(req.params.id);
    if (!book) {
       return res.status(404).json({ message: "Book Not Found" }); }

   // SEND RESPONSE
    res.json({message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


module.exports = router;