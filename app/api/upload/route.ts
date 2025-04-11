import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true,
}); 

// Upload ảnh
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Không có tệp nào được gửi" }, { status: 400 });
  }

  const timestamp = Date.now();
  const originalName = file.name.replace(/\s/g, "_").split(".")[0];
  const fileExt = file.name.split(".").pop();
  const publicId = `${timestamp}-${originalName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: "my_project",
          overwrite: true,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Lỗi khi upload ảnh:", error);
    return NextResponse.json({ error: "Không thể upload ảnh" }, { status: 500 });
  }
}

// Xoá ảnh
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Thiếu tham số 'url'" }, { status: 400 });
  }

  const getPublicIdFromUrl = (url: string): string | null => {
    try {
      // Lấy đường dẫn sau domain
      const urlPath = new URL(url).pathname;
      // Tìm phần sau /upload/ và trước dấu chấm cuối cùng
      const matches = urlPath.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      return matches ? matches[1] : null;
    } catch {
      return null;
    }
  };

  const publicId = getPublicIdFromUrl(imageUrl);

  if (!publicId) {
    return NextResponse.json({ error: "Không thể phân tích public_id" }, { status: 400 });
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ message: "Xóa ảnh thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa ảnh:", error);
    return NextResponse.json({ error: "Không thể xóa ảnh" }, { status: 500 });
  }
}
