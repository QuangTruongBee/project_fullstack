const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Tạo bài viết mới
router.post("/", verifyToken, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: "Tiêu đề và nội dung là bắt buộc" });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        authorId: req.user.id,
      },
      include: {
        author: true,
      },
    });

    res.json({
      ...newPost,
      authorName: newPost.author.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi tạo bài viết" });
  }
});

// Lấy tất cả bài viết có phân trang và tìm kiếm (search)
router.get("/", async (req, res) => {
  let { page = 1, limit = 5, search = "" } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  search = search.toString().toLowerCase();

  try {
    const whereCondition = search
      ? {
          title: {
            contains: search,
          },
        }
      : {};

    const total = await prisma.post.count({ where: whereCondition });

    const posts = await prisma.post.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { author: true, comments: true },
    });

    const postsWithAuthorName = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      authorName: post.author.name,
      authorAvatar: post.author.avatar || "",
      createdAt: post.createdAt,
      comments: post.comments,
    }));

    res.json({
      total,
      page,
      limit,
      posts: postsWithAuthorName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi lấy bài viết" });
  }
});

// Lấy bài viết của user hiện tại có phân trang và tìm kiếm (search)
router.get("/my-posts", verifyToken, async (req, res) => {
  let { page = 1, limit = 5, search = "" } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  search = search.toString().toLowerCase();

  try {
    const whereCondition = {
      authorId: req.user.id,
      ...(search
        ? {
            title: {
              contains: search,
            },
          }
        : {}),
    };

    const total = await prisma.post.count({ where: whereCondition });

    const posts = await prisma.post.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { author: true, comments: true },
    });

    const postsWithAuthorName = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      authorName: post.author.name,
      authorAvatar: post.author.avatar || "",
      createdAt: post.createdAt,
      comments: post.comments,
    }));

    res.json({
      total,
      page,
      limit,
      posts: postsWithAuthorName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi lấy bài viết của bạn" });
  }
});

// Thêm comment
router.post("/:postId/comments", verifyToken, async (req, res) => {
  const { text } = req.body;
  const postId = parseInt(req.params.postId);

  if (!text) {
    return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });

    const newComment = await prisma.comment.create({
      data: {
        content: text,
        authorId: req.user.id,
        postId: postId,
      },
    });

    res.json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi thêm bình luận" });
  }
});

// Chi tiết bài viết theo id, kèm bình luận
router.get("/:postId", verifyToken, async (req, res) => {
  const postId = parseInt(req.params.postId);
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const postData = {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      authorName: post.author.name,
      authorAvatar: post.author.avatar || "",
      createdAt: post.createdAt,
      comments: post.comments.map((c) => ({
        id: c.id,
        authorId: c.authorId,
        authorName: c.author.name,
        authorAvatar: c.author.avatar || "",
        text: c.content,
        createdAt: c.createdAt,
      })),
    };

    res.json(postData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Sửa bài viết
router.put("/:postId", verifyToken, async (req, res) => {
  const postId = parseInt(req.params.postId);
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Tiêu đề và nội dung là bắt buộc" });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });
    if (post.authorId !== req.user.id)
      return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa bài viết này" });

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { title, content },
    });

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi cập nhật bài viết" });
  }
});

// Xóa bài viết
router.delete("/:postId", verifyToken, async (req, res) => {
  const postId = parseInt(req.params.postId);

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });
    if (post.authorId !== req.user.id)
      return res.status(403).json({ message: "Bạn không có quyền xóa bài viết này" });

    await prisma.post.delete({ where: { id: postId } });

    res.json({ message: "Xóa bài viết thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi xóa bài viết" });
  }
});

// Sửa bình luận
router.put("/:postId/comments/:commentId", verifyToken, async (req, res) => {
  const commentId = parseInt(req.params.commentId);
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
  }

  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ message: "Bình luận không tồn tại" });
    if (comment.authorId !== req.user.id)
      return res.status(403).json({ message: "Bạn không có quyền sửa bình luận này" });

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: text },
    });

    res.json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi cập nhật bình luận" });
  }
});

// Xóa bình luận
router.delete("/:postId/comments/:commentId", verifyToken, async (req, res) => {
  const commentId = parseInt(req.params.commentId);

  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ message: "Bình luận không tồn tại" });
    if (comment.authorId !== req.user.id)
      return res.status(403).json({ message: "Bạn không có quyền xóa bình luận này" });

    await prisma.comment.delete({ where: { id: commentId } });

    res.json({ message: "Xóa bình luận thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi xóa bình luận" });
  }
});

module.exports = router;
