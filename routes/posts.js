// routes/posts.js
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const router = express.Router();
const posts = require("../data/posts");

// Setup AWS S3
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Setup multer to use S3 for image uploads
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "your-s3-bucket-name", // Replace with your actual S3 bucket name
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `${uuidv4()}${path.extname(file.originalname)}`); // Generate a unique filename
    },
  }),
});

// Validation middleware for post creation and editing
const validatePost = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .notEmpty()
    .withMessage("Title is required"),
  body("content")
    .isString()
    .withMessage("Content must be a string")
    .notEmpty()
    .withMessage("Content is required"),
  body("tags")
    .optional()
    .isString()
    .withMessage("Tags must be a string (comma separated)"),
];

// Get all posts with comments
router.get("/", (req, res) => {
  let filteredPosts = [...posts]; // Copy the posts array

  // Search functionality
  const { search } = req.query;
  if (search) {
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.content.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Sort functionality
  const { sort } = req.query;
  if (sort) {
    const [property, order] = sort.split("-"); // propertyName and asc/desc
    filteredPosts.sort((a, b) => {
      if (property && (order === "asc" || order === "desc")) {
        const sortOrder = order === "asc" ? 1 : -1;
        if (a[property] < b[property]) return -1 * sortOrder;
        if (a[property] > b[property]) return 1 * sortOrder;
        return 0;
      }
      return 0; // No sorting if sort format is incorrect
    });
  }

  // Pagination functionality
  const { page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10
  const startIndex = (page - 1) * limit; // Calculate starting index
  const endIndex = startIndex + parseInt(limit); // Calculate ending index

  const paginatedPosts = filteredPosts.slice(startIndex, endIndex); // Slice posts array based on pagination

  // Send paginated data along with total count
  res.json({
    total: filteredPosts.length, // Total number of posts after filtering and sorting
    page: parseInt(page), // Current page
    limit: parseInt(limit), // Number of posts per page
    data: paginatedPosts, // Paginated posts
  });
});

// Create a new post with validation and image upload
// Create a new post with validation and image upload
router.post(
  "/",
  upload.single("image"), // Handle single file upload
  validatePost,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if image is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const { title, content, tags = "" } = req.body;
    
    // Check if req.file.location exists
    if (!req.file.location) {
      return res.status(500).json({ message: "Error uploading image to S3" });
    }
    
    const imageLocation = req.file.location; // Get the S3 file URL
    console.log("Uploaded Image URL: ", imageLocation); // Debugging log

    const newPost = {
      id: uuidv4(),
      title,
      content,
      tags: tags.split(","),
      liked: false,
      image: imageLocation, // Store the S3 image URL in the post
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save new post and respond
    posts.push(newPost);
    res.status(201).json(newPost);
  }
);

// Get a post by ID
router.get("/:id", (req, res) => {
  const { id } = req.params; // Get the post id from route parameters
  const post = posts.find((p) => p.id === id); // Find the post by id

  if (post) {
    res.json(post); // If post is found, return it
  } else {
    res.status(404).json({ message: "Post not found" }); // If not found, return 404
  }
});

// Edit a post with optional image upload
router.put(
  "/:id",
  upload.single("image"), // Handle single file upload for edit
  validatePost,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = posts.find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const { title, content, tags = "" } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags ? tags.split(",") : post.tags;
    post.updatedAt = new Date();

    if (req.file) {
      post.image = req.file.location; // Update image if a new one is uploaded
    }

    res.json(post);
  }
);

// Delete a post
router.delete("/:id", (req, res) => {
  const postIndex = posts.findIndex((p) => p.id === req.params.id);
  if (postIndex === -1)
    return res.status(404).json({ message: "Post not found" });

  posts.splice(postIndex, 1);
  res.status(204).send();
});

// Like a post
router.post("/:id/like", (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.liked = true;
  res.json({ liked: post.liked });
});

// Dislike a post
router.post("/:id/dislike", (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.liked = false;
  res.json({ liked: post.liked });
});

module.exports = router;
