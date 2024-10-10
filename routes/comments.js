// routes/comments.js
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const posts = require("../data/posts");

// Get comments for a specific post
router.get("/:postId", (req, res) => {
  const post = posts.find((p) => p.id === req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  res.json(post.comments);
});

// Add a comment to a specific post
router.post("/:postId", (req, res) => {
  const post = posts.find((p) => p.id === req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const { content } = req.body;
  if (!content || typeof content !== "string") {
    return res
      .status(400)
      .json({ message: "Comment content is required and must be a string" });
  }

  const newComment = {
    id: uuidv4(),
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  post.comments.push(newComment);
  res.status(201).json(newComment);
});

// Edit a specific comment on a post
router.put("/:postId/:commentId", (req, res) => {
  const post = posts.find((p) => p.id === req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const comment = post.comments.find((c) => c.id === req.params.commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  const { content } = req.body;
  if (!content || typeof content !== "string") {
    return res
      .status(400)
      .json({ message: "Comment content is required and must be a string" });
  }

  comment.content = content;
  comment.updatedAt = new Date(); // Optional: Add updatedAt field

  res.json(comment); // Return updated comment
});

// Delete a specific comment from a post
router.delete("/:postId/:commentId", (req, res) => {
  const post = posts.find((p) => p.id === req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const commentIndex = post.comments.findIndex(
    (c) => c.id === req.params.commentId
  );
  if (commentIndex === -1)
    return res.status(404).json({ message: "Comment not found" });

  post.comments.splice(commentIndex, 1);
  res.status(204).send();
});

module.exports = router;
