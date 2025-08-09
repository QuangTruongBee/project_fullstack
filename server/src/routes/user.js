const express = require("express");
const multer = require("multer");
const { verifyToken } = require("../middlewares/auth.middleware");
const prisma = require("../db");
const cloudinary = require("../cloudinary");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() }); // lưu tạm trong RAM

router.put(
  "/user/avatar",
  verifyToken,
  upload.single("avatar"), // nhận file field tên avatar
  async (req, res) => {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ message: "Chưa gửi file ảnh" });
      }

      // Upload lên Cloudinary
      const result = await cloudinary.uploader.upload_stream(
        { folder: "avatars" },
        async (error, result) => {
          if (error) return res.status(500).json({ message: "Upload lỗi", error });

          // Lưu URL avatar vào DB
          await prisma.user.update({
            where: { id: userId },
            data: { avatar: result.secure_url },
          });

          return res.json({ message: "Cập nhật avatar thành công", url: result.secure_url });
        }
      );

      // Ghi buffer file vào upload_stream
      result.end(req.file.buffer);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  }
);

module.exports = router;
