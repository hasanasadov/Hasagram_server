const express = require("express");
const router = express.Router();

const docs = {
  posts: {
    getAll: {
      method: "GET",
      route: "/posts",
      description: "Get all posts with optional search, sort, and pagination",
      queryParams: {
        search: "String (Optional) - Search posts by title or content",
        sort: "String (Optional) - Sort posts by property (e.g., 'title-asc')",
        page: "Number (Optional) - Page number for pagination (default: 1)",
        limit: "Number (Optional) - Number of posts per page (default: 10)",
      },
      response: {
        total: "Total number of filtered posts",
        page: "Current page number",
        limit: "Number of posts per page",
        data: "Array of paginated posts",
      },
    },
    getOne: {
      method: "GET",
      route: "/posts/:id",
      description: "Get a single post by ID",
      params: {
        id: "String - Post ID",
      },
      response: {
        id: "Post ID",
        title: "Post title",
        content: "Post content",
        comments: "Array of comments",
        image: "URL of the post image",
      },
    },
    create: {
      method: "POST",
      route: "/posts",
      description: "Create a new post with image upload",
      bodyParams: {
        title: "String - Post title",
        content: "String - Post content",
        tags: "String - Optional comma-separated tags",
        image: "File - Image file to upload",
      },
      response: {
        id: "Newly created post ID",
        title: "Post title",
        content: "Post content",
        image: "URL of the post image",
      },
    },
    edit: {
      method: "PUT",
      route: "/posts/:id",
      description: "Edit an existing post with optional image upload",
      params: {
        id: "String - Post ID",
      },
      bodyParams: {
        title: "String - New title",
        content: "String - New content",
        tags: "String - Optional comma-separated tags",
        image: "File - Optional new image to upload",
      },
      response: {
        id: "Updated post ID",
        title: "Updated post title",
        content: "Updated post content",
        image: "Updated URL of the post image",
      },
    },
    delete: {
      method: "DELETE",
      route: "/posts/:id",
      description: "Delete a post by ID",
      params: {
        id: "String - Post ID",
      },
      response: {
        status: "204 No Content",
      },
    },
    like: {
      method: "POST",
      route: "/posts/:id/like",
      description: "Like a post by ID",
      params: {
        id: "String - Post ID",
      },
      response: {
        liked: "Boolean - Whether the post is liked",
      },
    },
    dislike: {
      method: "POST",
      route: "/posts/:id/dislike",
      description: "Dislike a post by ID",
      params: {
        id: "String - Post ID",
      },
      response: {
        liked: "Boolean - Whether the post is disliked",
      },
    },
  },
  comments: {
    getAll: {
      method: "GET",
      route: "/comments/:postId",
      description: "Get all comments for a specific post",
      params: {
        postId: "String - Post ID",
      },
      response: {
        comments: "Array of comments",
      },
    },
    create: {
      method: "POST",
      route: "/comments/:postId",
      description: "Add a comment to a specific post",
      params: {
        postId: "String - Post ID",
      },
      bodyParams: {
        content: "String - Comment content",
      },
      response: {
        id: "New comment ID",
        content: "Comment content",
        createdAt: "Comment creation date",
      },
    },
    edit: {
      method: "PUT",
      route: "/comments/:postId/:commentId",
      description: "Edit a specific comment on a post",
      params: {
        postId: "String - Post ID",
        commentId: "String - Comment ID",
      },
      bodyParams: {
        content: "String - Updated comment content",
      },
      response: {
        id: "Updated comment ID",
        content: "Updated comment content",
        updatedAt: "Comment update date",
      },
    },
    delete: {
      method: "DELETE",
      route: "/comments/:postId/:commentId",
      description: "Delete a specific comment from a post",
      params: {
        postId: "String - Post ID",
        commentId: "String - Comment ID",
      },
      response: {
        status: "204 No Content",
      },
    },
  },
};

router.get("/", (req, res) => {
  res.json(docs);
});

module.exports = router;
