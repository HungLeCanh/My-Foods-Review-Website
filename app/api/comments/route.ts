import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Lấy comments theo foodId: /api/comments?foodId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const foodId = searchParams.get("foodId");

  if (!foodId) return NextResponse.json({ error: "Missing foodId" }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { foodId },
    orderBy: { createdAt: "desc" }, // Sắp xếp nếu cần
  });

  return NextResponse.json(comments);
}

// Thêm comment mới
export async function POST(req: Request) {
  const { content, userId, foodId } = await req.json();

  const newComment = await prisma.comment.create({
    data: { content, userId, foodId },
  });

  return NextResponse.json(newComment);
}
