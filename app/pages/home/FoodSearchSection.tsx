"use client";

import { useState, useRef } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRandom } from "react-icons/fa";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";
import FoodDetailModal from "./FoodDetailModal";
import { categories } from "../../lib/constants/categories";

type fixedFood = {
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
  likes: { userId: string }[];
  category: string[]; // dùng để lọc món theo danh mục
}

export default function FoodSearchSection({
  userId,
  foods,
  setFoods,
}: {
  userId: string;
  foods: fixedFood[];
  setFoods: React.Dispatch<React.SetStateAction<fixedFood[]>>;
}) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<fixedFood | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategories, setShowCategories] = useState(false);

  // Correctly type the ref
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Group categories for better visualization
  const categoryGroups = [
    { title: "Hương vị / Đặc tính", items: categories.slice(0, 8) },
    { title: "Chế độ ăn uống", items: categories.slice(8, 16) },
    { title: "Cách chế biến", items: categories.slice(16, 26) },
    { title: "Khu vực / Phong cách", items: categories.slice(26, 36) },
    { title: "Thời điểm dùng món", items: categories.slice(36, 46) },
    { title: "Thức uống", items: categories.slice(46) },
  ];

  const handleToggleLike = async (foodId: string) => {
    if(!userId){
      alert("Bạn không thể thực hiện thao tác này hãy thử đăng nhập.");
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

  const toggleCategorySelection = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
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

  const scroll = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const filteredFoods = foods.filter((food) => {
    // Lọc theo từ khóa tìm kiếm
    const matchesSearch = 
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      food.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.category.join(", ").toLowerCase().includes(searchTerm.toLowerCase()) || 
      food.business.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Lọc theo danh mục đã chọn - hiển thị món ăn nếu nó có ít nhất một danh mục trong số danh mục được chọn
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.some(selectedCat => food.category.includes(selectedCat));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Top row: Search and Refresh */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search input */}
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="🔍 Tìm món ăn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-black w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
          />
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
      
      {/* Categories header and toggle button on the same row */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-amber-800">Danh mục món ăn</h3>
        <div className="flex items-center gap-4">
          {selectedCategories.length > 0 && (
            <button 
              onClick={clearAllCategories}
              className="text-sm text-amber-600 hover:text-amber-800"
            >
              Xóa tất cả ({selectedCategories.length})
            </button>
          )}
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="text-sm text-orange-600 hover:text-orange-800 underline"
          >
            {showCategories ? "Ẩn danh mục ▲" : "Hiện danh mục ▼"}
          </button>
        </div>
      </div>

      {/* Categories selection with horizontal scroll */}
      <div className="mb-8">
        {showCategories && (
          <div className="relative">
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md text-amber-800 hover:bg-amber-100"
            >
              <IoChevronBack size={24} />
            </button>
            
            <div 
              ref={categoryScrollRef}
              className="flex flex-wrap gap-2 overflow-x-auto py-2 px-8 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categoryGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="flex flex-col min-w-fit mr-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">{group.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((category, index) => (
                      <button
                        key={`${groupIndex}-${index}`}
                        onClick={() => toggleCategorySelection(category)}
                        className={`text-sm px-3 py-1.5 rounded-full border transition-colors
                          ${selectedCategories.includes(category) 
                            ? 'bg-orange-500 text-white border-orange-500' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-orange-50'}
                        `}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md text-amber-800 hover:bg-amber-100"
            >
              <IoChevronForward size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Food grid */}
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
                
                {/* Hiển thị danh mục - tối đa 2 danh mục + badge "+n" nếu có nhiều hơn */}
                {food.category && food.category.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {food.category.slice(0, 2).map((cat, index) => (
                      <span key={index} className="inline-block bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full">
                        {cat}
                      </span>
                    ))}
                    {food.category.length > 2 && (
                      <span className="inline-block bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full">
                        +{food.category.length - 2}
                      </span>
                    )}
                  </div>
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
          <p className="text-center col-span-full text-gray-600 py-8">
            Không tìm thấy món ăn phù hợp với tiêu chí đã chọn.
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