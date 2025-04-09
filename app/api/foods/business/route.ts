import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

// Lấy danh sách món ăn của doanh nghiệp đang đăng nhập
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "business") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const business = await prisma.business.findUnique({
      where: { email: session.user.email },
      include: { foods: true },
    });
  
    if (!business) {
      return NextResponse.json({ error: "Doanh nghiệp không tồn tại" }, { status: 404 });
    }
  
    return NextResponse.json(business.foods);
  }