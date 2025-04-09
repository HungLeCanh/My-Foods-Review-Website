import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Lấy danh sách doanh nghiệp
export async function GET() {
  const businesses = await prisma.business.findMany();
  return NextResponse.json(businesses);
}

// Đăng ký tài khoản doanh nghiệp
export async function POST(req: Request) {
  const { name, email, password, description, image, address } = await req.json();
  const existingBusiness = await prisma.business.findUnique({ where: { email } });

  if (existingBusiness) {
    return NextResponse.json({ error: "Email doanh nghiệp đã tồn tại" }, { status: 400 });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const newBusiness = await prisma.business.create({
    data: { name, email, password: hashedPassword, description, image, address },
  });

  return NextResponse.json(newBusiness);
}

// Cập nhật thông tin doanh nghiệp
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "business") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, image, address } = await req.json();
  const updatedBusiness = await prisma.business.update({
    where: { email: session.user.email },
    data: { name, description, image, address },
  });
  
  return NextResponse.json(updatedBusiness);
}
