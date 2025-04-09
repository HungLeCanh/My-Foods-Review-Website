import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/app/lib/auth";

const prisma = new PrismaClient();

// Lấy thông tin user hiện tại để phục vụ cho tab Yêu Thích
export async function GET() {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Fetch user with their liked foods
    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        likes: {
          include: {
            food: {
              include: {
                business: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    
    // If user not found
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Transform the data to a more convenient format for the frontend
    const transformedUser = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      image: currentUser.image,
      likedFoods: currentUser.likes.map(like => ({
        id: like.food.id,
        name: like.food.name,
        description: like.food.description,
        price: like.food.price,
        image: like.food.image,
        category: like.food.category,
        business: like.food.business,
        likeId: like.id,
        likedAt: like.createdAt,
      })),
    };
    
    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

// Cập nhật thông tin người dùng
export async function PUT(request: NextRequest) {
  try {
    // Kiểm tra xác thực
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Kiểm tra người dùng tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Xử lý dữ liệu JSON
    const data = await request.json();
    const { name, email, image } = data;
    
    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }
    
    // Kiểm tra email đã tồn tại (nếu thay đổi)
    if (email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email }
      });
      
      if (userWithEmail && userWithEmail.id !== userId) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }
    
    // Cập nhật thông tin
    const updateData: any = {
      name,
      email,
      image
    };
    
    // Cập nhật trong database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        likes: {
          include: {
            food: {
              include: {
                business: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    
    // Trả về thông tin đã được cập nhật
    const transformedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      likedFoods: updatedUser.likes.map(like => ({
        id: like.food.id,
        name: like.food.name,
        description: like.food.description,
        price: like.food.price,
        image: like.food.image,
        category: like.food.category,
        business: like.food.business,
        likeId: like.id,
        likedAt: like.createdAt,
      })),
    };
    
    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}