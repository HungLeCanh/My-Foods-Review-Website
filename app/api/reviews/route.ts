import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Lấy reviews theo foodId: /api/reviews?foodId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const foodId = searchParams.get("foodId");

  if (!foodId) return NextResponse.json({ error: "Missing foodId" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { foodId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

// Thêm review mới
export async function POST(req: Request) {
  const { rating, comment, userId, foodId } = await req.json();

  const newReview = await prisma.review.create({
    data: { rating, comment, userId, foodId },
  });

  return NextResponse.json(newReview);
}
