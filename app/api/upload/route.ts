import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Upload ảnh
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Không có tệp nào được gửi" }, { status: 400 });
  }

  // Định dạng tên file duy nhất
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
  const filePath = join(process.cwd(), "public/uploads", fileName);
  const fileUrl = fileName; // Đường dẫn để lưu vào DB

  // Đọc dữ liệu file
  const buffer = Buffer.from(await file.arrayBuffer());

  // Ghi file vào thư mục public/uploads
  await writeFile(filePath, buffer);

  return NextResponse.json({ url: fileUrl });
}

// Xóa ảnh
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Thiếu tham số 'url'" }, { status: 400 });
  }

  const filePath = join(process.cwd(), "public/uploads", imageUrl);

  try {
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Ảnh không tồn tại" }, { status: 404 });
    }

    await unlink(filePath);

    return NextResponse.json({ message: "Xóa ảnh thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa ảnh:", error);
    return NextResponse.json({ error: "Không thể xóa ảnh" }, { status: 500 });
  }
}
