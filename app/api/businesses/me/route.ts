import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
    
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
  }
  
  console.log("Current business email:", session.user.email);
  
  // Thay vì tin tưởng vào role từ session, hãy kiểm tra trực tiếp từ database
  const business = await prisma.business.findUnique({
    where: { email: session.user.email },
    // include: { foods: true },
  });
  
  if (!business) {
    return NextResponse.json({ 
      error: "Business not found or user is not a business account",
      userEmail: session.user.email
    }, { status: 404 });
  }

  // Xóa password khỏi response nếu tồn tại
  const { password, ...businessWithoutPassword } = business;
  
  return NextResponse.json({ business: businessWithoutPassword});
}
