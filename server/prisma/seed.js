const { PrismaClient } = require("../src/generated/prisma");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu...");

  // Xóa dữ liệu cũ
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Hash mật khẩu
  const password1 = await bcrypt.hash("123456", 10);
  const password2 = await bcrypt.hash("abcdef", 10);

  // Thêm user mẫu
  const user1 = await prisma.user.create({
    data: {
      name: "Nguyen Van A",
      email: "a@example.com",
      password: password1, // đã hash
      avatar: "https://i.pravatar.cc/150?u=a",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Tran Thi B",
      email: "b@example.com",
      password: password2, // đã hash
      avatar: "https://i.pravatar.cc/150?u=b",
    },
  });

  // Thêm post mẫu
  const post1 = await prisma.post.create({
    data: {
      title: "Bài viết đầu tiên",
      content: "Nội dung bài viết đầu tiên...",
      authorId: user1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "Bài viết thứ hai",
      content: "Nội dung bài viết thứ hai...",
      authorId: user2.id,
    },
  });

  // Thêm comment mẫu
  await prisma.comment.createMany({
    data: [
      {
        content: "Bình luận 1 của user 2 vào post 1",
        authorId: user2.id,
        postId: post1.id,
      },
      {
        content: "Bình luận 2 của user 1 vào post 2",
        authorId: user1.id,
        postId: post2.id,
      },
    ],
  });

  console.log("✅ Seed dữ liệu thành công!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
