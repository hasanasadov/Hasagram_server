// In-memory array to store posts
const posts = [
  {
    id: "1",
    title: "Hello World",
    content: "This is my first post",
    tags: ["first-post", "hello-world"],
    liked: false,
    image: "https://picsum.photos/200",
    comments: [],
    updatedAt: new Date(),
  },
];

module.exports = posts;
