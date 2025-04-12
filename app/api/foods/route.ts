import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

// Lấy danh sách món ăn, có thể lọc theo city
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  const foods = await prisma.food.findMany({
    where: city
      ? {
          business: {
            address: {
              contains: city,
              // mode: "insensitive", // không phân biệt hoa thường
            },
          },
        }
      : undefined,
    include: {
      business: {
        select: {
          id: true,
          name: true,
          image: true,
          description: true,
          address: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      reviews: true,
      likes: true,
      comments: true,
    },
  });

  return NextResponse.json(foods);
}

// Thêm món ăn mới cho doanh nghiệp
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "business") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findUnique({
    where: { email: session.user.email },
  });

  if (!business) {
    return NextResponse.json({ error: "Doanh nghiệp không tồn tại" }, { status: 404 });
  }

  const { name, description, price, image, category } = await req.json();
  
  const newFood = await prisma.food.create({
    data: {
      name,
      description,
      price,
      image,
      category,
      businessId: business.id
    },
  });

  return NextResponse.json(newFood);
}


export async function PUT(req: NextRequest) {
  const data = await req.json();

  const { id, ...updateData } = data;

  if (!id) {
    return NextResponse.json({ error: "Thiếu ID của món ăn" }, { status: 400 });
  }

  try {
    const updatedFood = await prisma.food.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedFood, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Không thể cập nhật món ăn" }, { status: 500 });
  }
}