import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Người dùng thích món ăn
export async function POST(req: Request) {
  const { userId, foodId } = await req.json();

  const existingLike = await prisma.like.findUnique({
    where: { userId_foodId: { userId, foodId } },
  });

  if (existingLike) {
    return NextResponse.json({ error: "Đã thích món này" }, { status: 400 });
  }

  const newLike = await prisma.like.create({ data: { userId, foodId } });
  return NextResponse.json(newLike);
}

// Người dùng bỏ thích món ăn
export async function DELETE(req: Request) {
  const { userId, foodId } = await req.json();

  try {
    const existingLike = await prisma.like.findUnique({
      where: { userId_foodId: { userId, foodId } },
    });

    if (!existingLike) {
      return NextResponse.json({ error: "Chưa từng thích món này" }, { status: 404 });
    }

    await prisma.like.delete({
      where: { userId_foodId: { userId, foodId } },
    });

    return NextResponse.json({ message: "Đã bỏ thích" });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}


