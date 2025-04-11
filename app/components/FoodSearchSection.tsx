"use client";

import { useState } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRandom } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import FoodDetailModal from "./FoodDetailModal";

type Food = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  business: { 
    id: string;
    name: string;
    image: string | null; 
  };
  likes: { userId: string }[]; // danh sách người đã thích
  category?: string; // thêm trường category nếu có
};

export default function FoodSearchSection({
    userId,
    role,
    foods,
    setFoods,
  }: {
    userId: string;
    role: string
    foods: Food[];
    setFoods: React.Dispatch<React.SetStateAction<Food[]>>;
  }) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  
  const categories = ["Tất cả", "Món ngọt", "Món chay", "Món mặn", "Món cay", "Món chua"];

  const handleToggleLike = async (foodId: string) => {
    if(role === "business"){
      // Thông báo không thể thực hiện thao tác khi đang dùng tài khoản role=business
      alert("Bạn không thể thực hiện thao tác này bằng tài khoản doanh nghiệp. Vui lòng sử dụng tài khoản người dùng.");
      return;
    }
    const food = foods.find((f) => f.id === foodId);
    const isLiked = food?.likes.some((like) => like.userId === userId);

    if (isLiked) {
      await fetch("/api/likes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId, foodId }),
      });
    } else {
      await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId, foodId }),
      });
    }

    // Cập nhật lại UI
    setFoods((prev) =>
      prev.map((f) =>
        f.id === foodId
          ? {
              ...f,
              likes: isLiked
                ? f.likes.filter((l) => l.userId !== userId)
                : [...f.likes, { userId: userId }],
            }
          : f
      )
    );
  };

  const toggleCategoryDropdown = () => {
    setCategoryDropdownOpen(!categoryDropdownOpen);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCategoryDropdownOpen(false);
  };

  const shuffleFoods = () => {
    setFoods(prevFoods => {
      const shuffled = [...prevFoods];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  };

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search input */}
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            
            placeholder="🔍 Tìm món ăn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-black w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm "
          />
        </div>
        
        {/* Category dropdown */}
        <div className="relative">
          <div className="flex items-center">
            <span className="mr-2 text-amber-800 font-medium">Danh mục:</span>
            <button 
              onClick={toggleCategoryDropdown}
              className="text-black flex items-center justify-between bg-white p-3 rounded-xl border border-gray-300 shadow-sm min-w-[180px] focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <span>{selectedCategory}</span>
              <IoIosArrowDown className={`ml-2 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {categoryDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={` text-black block w-full text-left px-4 py-2 hover:bg-orange-50 ${
                    selectedCategory === category ? 'bg-orange-100 font-medium' : ''
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Refresh/Shuffle button */}
        <button 
          onClick={shuffleFoods}
          className="flex items-center justify-center p-3 bg-amber-100 text-amber-800 rounded-xl hover:bg-amber-200 transition-colors shadow-sm"
          title="Xáo trộn danh sách món ăn"
        >
          <FaRandom className="mr-2" />
          <span>Đổi mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredFoods.map((food) => {
          const isLiked = food.likes.some((like) => like.userId === userId);
          return (
            <div
              key={food.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col"
            >
              <img
                src={food.image}
                alt={food.name}
                className="h-40 w-full object-cover"
              />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-amber-800">{food.name}</h3>
                  <button onClick={() => handleToggleLike(food.id)}>
                    {isLiked ? (
                      <AiFillHeart className="text-red-500 text-xl" />
                    ) : (
                      <AiOutlineHeart className="text-gray-400 text-xl" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1 truncate">{food.business.name}</p>
                {food.category && (
                  <span className="mt-2 inline-block bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full">
                    {food.category}
                  </span>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-orange-600 font-bold">
                    {food.price.toLocaleString()}đ
                  </span>
                  <button
                    className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full hover:bg-orange-200 transition"
                    onClick={() => setSelectedFood(food)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredFoods.length === 0 && (
          <p className="text-center col-span-full text-gray-600">
            Không tìm thấy món ăn phù hợp.
          </p>
        )}
      </div>

      {/* Modal Chi Tiết */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          userId={userId}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
}