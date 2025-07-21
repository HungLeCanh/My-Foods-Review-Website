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

type UserData = {
  id: string;
  name: string;
  email: string;
  image: string;
  likedFoods: LikedFood[];
};

export default function FavoritesPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnliking, setIsUnliking] = useState(false);

  // Fetch user data and liked foods
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/users/me");

        if (res.ok) {
          const data: UserData = await res.json();
          setUserData(data);
        } else {
          toast.error("Không thể tải dữ liệu yêu thích");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUnlike = async (foodId: string) => {
    if (!userData?.id) {
      toast.error("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    setIsUnliking(true);
    try {
      const response = await fetch("/api/likes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.id, foodId }),
      });

      if (response.ok) {
        // Cập nhật state local bằng cách loại bỏ món ăn đã unlike
        setUserData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            likedFoods: prev.likedFoods.filter(food => food.id !== foodId)
          };
        });
        toast.success("Đã bỏ yêu thích món ăn này");
      } else {
        const error = await response.json();
        toast.error(error.message || "Có lỗi xảy ra khi bỏ yêu thích");
      }
    } catch (error) {
      console.error("Error unliking food:", error);
      toast.error("Có lỗi xảy ra khi bỏ yêu thích");
    } finally {
      setIsUnliking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
        <p className="text-amber-700">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-semibold text-amber-800 mb-3">Không thể tải dữ liệu</h2>
        <p className="text-amber-700 text-center">
          Vui lòng thử lại sau hoặc kiểm tra kết nối internet của bạn
        </p>
      </div>
    );
  }

  if (userData.likedFoods.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
            <Image
              src={userData.image || "/uploads/default-avatar.png"}
              alt={userData.name}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-amber-800">{userData.name}</h1>
            <p className="text-amber-600">{userData.email}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <div className="text-7xl mb-5">❤️</div>
          <h2 className="text-2xl font-semibold text-amber-800 mb-3">Chưa có món nào được yêu thích</h2>
          <p className="text-amber-700">
            Hãy nhấn vào biểu tượng trái tim ở các món ăn để thêm vào danh sách yêu thích của bạn
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* User Info Header */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
          <Image
            src={userData.image || "/uploads/default-avatar.png"}
            alt={userData.name}
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-amber-800">{userData.name}</h1>
          <p className="text-amber-600">{userData.email}</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-amber-800 mb-6">
        Danh sách món ăn yêu thích của bạn ({userData.likedFoods.length} món)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userData.likedFoods.map((food) => (
          <div
            key={food.id}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-amber-100"
          >
            <div className="relative h-48 w-full">
              <Image
                src={food.image || "/uploads/default-food.jpg"}
                alt={food.name}
                fill
                className="object-cover"
              />
              <button
                onClick={() => handleUnlike(food.id)}
                disabled={isUnliking}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Bỏ yêu thích"
              >
                <FaHeart className={`text-xl ${isUnliking ? 'text-gray-400' : 'text-red-500'}`} />
              </button>
              
              {/* Category badge */}
              {food.category && (
                <div className="absolute bottom-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs">
                  {food.category.split(',')[0].trim()}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-amber-900 truncate flex-1 mr-2">
                  {food.name}
                </h3>
                <span className="font-bold text-amber-700 whitespace-nowrap">
                  {food.price.toLocaleString('vi-VN')} ₫
                </span>
              </div>
              
              <p className="text-amber-700 text-sm mb-3 h-12 overflow-hidden line-clamp-2">
                {food.description || "Không có mô tả"}
              </p>
              
              <div className="flex items-center justify-between text-gray-600 text-sm">
                <div className="flex items-center flex-1">
                  <div className="w-5 h-5 rounded-full overflow-hidden mr-2 flex-shrink-0">
                    <Image
                      src={food.business.image || "/uploads/default-business.png"}
                      alt={food.business.name}
                      width={20}
                      height={20}
                      className="object-cover"
                    />
                  </div>
                  <span className="truncate">{food.business.name}</span>
                </div>
                
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(food.likedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}