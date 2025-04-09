"use client";

import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import Image from "next/image";
import { toast } from "react-hot-toast";

type LikedFood = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string | null;
  business: {
    id: string;
    name: string;
    image: string | null;
  };
  likeId: string;
  likedAt: string;
};

type FavoritesSectionProps = {
  userId: string;
  likedFoods: LikedFood[];
  onUnlike: (foodId: string) => void;
};

export default function FavoritesSection({ userId, likedFoods, onUnlike }: FavoritesSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUnlike = async (foodId: string) => {
    if (!userId) {
      toast.error("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/likes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId, foodId }),
      });

      if (response.ok) {
        onUnlike(foodId);
        toast.success("Đã bỏ yêu thích món ăn này");
      } else {
        const error = await response.json();
        toast.error(error.message || "Có lỗi xảy ra khi bỏ yêu thích");
      }
    } catch (error) {
      console.error("Error unliking food:", error);
      toast.error("Có lỗi xảy ra khi bỏ yêu thích");
    } finally {
      setIsLoading(false);
    }
  };

  if (likedFoods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <div className="text-7xl mb-5">❤️</div>
        <h2 className="text-2xl font-semibold text-amber-800 mb-3">Chưa có món nào được yêu thích</h2>
        <p className="text-amber-700">
          Hãy nhấn vào biểu tượng trái tim ở các món ăn để thêm vào danh sách yêu thích của bạn
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h2 className="text-2xl font-semibold text-amber-800 mb-6">
        Danh sách món ăn yêu thích của bạn
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {likedFoods.map((food) => (
          <div
            key={food.id}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-amber-100"
          >
            <div className="relative h-48 w-full">
              <Image
                src={food.image ? `/uploads/${food.image}` : "/uploads/default-food.jpg"}
                alt={food.name}
                fill
                className="object-cover"
              />
              <button
                onClick={() => handleUnlike(food.id)}
                disabled={isLoading}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
              >
                <FaHeart className="text-red-500 text-xl" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-amber-900 truncate">
                  {food.name}
                </h3>
                <span className="font-bold text-amber-700">
                  {food.price.toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <p className="text-amber-700 text-sm mb-3 h-12 overflow-hidden">
                {food.description || "Không có mô tả"}
              </p>
              <div className="flex items-center text-gray-600 text-sm">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full overflow-hidden mr-1">
                    <Image
                      src={food.business.image ? `/uploads/${food.business.image}` : "/uploads/default-business.jpg"}
                      alt={food.business.name}
                      width={20}
                      height={20}
                      className="object-cover"
                    />
                  </div>
                  <span className="truncate">{food.business.name}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}