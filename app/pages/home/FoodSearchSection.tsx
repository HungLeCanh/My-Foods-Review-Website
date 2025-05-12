"use client";

import { useState, useRef, useEffect } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRandom } from "react-icons/fa";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { BiCategoryAlt } from "react-icons/bi";
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
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Correctly type the refs
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Group categories for better visualization
  const categoryGroups = [
    { title: "Hương vị / Đặc tính", items: categories.slice(0, 8) },
    { title: "Chế độ ăn uống", items: categories.slice(8, 16) },
    { title: "Cách chế biến", items: categories.slice(16, 26) },
    { title: "Khu vực / Phong cách", items: categories.slice(26, 36) },
    { title: "Thời điểm dùng món", items: categories.slice(36, 46) },
    { title: "Thức uống", items: categories.slice(46) },
  ];

  // Handle click outside sidebar to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowMobileSidebar(false);
      }
    }

    if (showMobileSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMobileSidebar]);

  // Lock scroll when sidebar is open
  useEffect(() => {
    if (showMobileSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showMobileSidebar]);

  const handleToggleLike = async (foodId: string) => {
    if(!userId){
      alert("Bạn không thể thực hiện thao tác này hãy thử đăng nhập.");
      return;
    }
    const food = foods.find((f) => f.id === foodId);
    const isLiked = food?.likes.some((like) => like.userId === userId);

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

  const changeGroup = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setActiveGroupIndex(prev => (prev === 0 ? categoryGroups.length - 1 : prev - 1));
    } else {
      setActiveGroupIndex(prev => (prev === categoryGroups.length - 1 ? 0 : prev + 1));
    }
  };

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(prev => !prev);
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

  // Categories sidebar for mobile
  const MobileCategorySidebar = () => (
    <>
      {/* Overlay for mobile sidebar backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 transition-opacity duration-300 md:hidden ${
          showMobileSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setShowMobileSidebar(false)}
      />

      {/* Sidebar content */}
      <div 
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-3/4 bg-white z-30 overflow-y-auto shadow-xl md:hidden
                    transform transition-transform duration-1000 ease-in-out
                    ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4">
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-amber-800">Danh mục món ăn</h3>
            <button 
              onClick={() => setShowMobileSidebar(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <IoMdClose size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Clear categories button */}
          {selectedCategories.length > 0 && (
            <button 
              onClick={clearAllCategories}
              className="text-sm text-amber-600 hover:text-amber-800 mb-4"
            >
              Xóa tất cả ({selectedCategories.length})
            </button>
          )}

          {/* Group navigation tabs */}
          <div className="flex overflow-x-auto scrollbar-hide mb-3">
            {categoryGroups.map((group, index) => (
              <button
                key={index}
                onClick={() => setActiveGroupIndex(index)}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap mx-1 rounded-lg transition-colors
                  ${activeGroupIndex === index 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-white text-amber-800 hover:bg-amber-100'}
                `}
              >
                {group.title}
              </button>
            ))}
          </div>
          
          {/* Active category group */}
          <div className="relative">
            <button 
              onClick={() => changeGroup('prev')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md text-amber-800 hover:bg-amber-100"
            >
              <IoChevronBack size={24} />
            </button>
            
            <div className="flex flex-wrap justify-center gap-2 px-10 py-3">
              {categoryGroups[activeGroupIndex].items.map((category, index) => (
                <button
                  key={index}
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
            
            <button 
              onClick={() => changeGroup('next')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md text-amber-800 hover:bg-amber-100"
            >
              <IoChevronForward size={24} />
            </button>
          </div>

          {/* Group indicator */}
          <div className="flex justify-center mt-2 gap-1">
            {categoryGroups.map((_, index) => (
              <span 
                key={index} 
                className={`inline-block w-2 h-2 rounded-full ${index === activeGroupIndex ? 'bg-amber-500' : 'bg-amber-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Top row: Search and Refresh */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search input */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="🔍 Tìm món ăn, mô tả, danh mục, cửa hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-black w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
          />
        </div>
        
        {/* Right side actions: Category toggle (mobile) and Refresh button */}
        <div className="flex gap-2">
          {/* Mobile category toggle button */}
          <button 
            onClick={toggleMobileSidebar}
            className="md:hidden flex items-center justify-center p-3 bg-amber-100 text-amber-800 rounded-xl hover:bg-amber-200 transition-colors shadow-sm"
            title="Mở danh mục món ăn"
          >
            <BiCategoryAlt className="mr-2" />
            <span>Danh mục</span>
          </button>
          
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
      </div>
      
      {/* Desktop Categories section - hidden on mobile */}
      <div className="hidden md:block">
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

        {/* Original Categories UI for desktop */}
        {showCategories && (
          <div className="mb-6 bg-amber-50 rounded-xl p-3 shadow-sm">
            {/* Group navigation tabs */}
            <div className="flex overflow-x-auto scrollbar-hide mb-3">
              {categoryGroups.map((group, index) => (
                <button
                  key={index}
                  onClick={() => setActiveGroupIndex(index)}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap mx-1 rounded-lg transition-colors
                    ${activeGroupIndex === index 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-white text-amber-800 hover:bg-amber-100'}
                  `}
                >
                  {group.title}
                </button>
              ))}
            </div>
            
            {/* Active category group */}
            <div className="relative">
              <button 
                onClick={() => changeGroup('prev')}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md text-amber-800 hover:bg-amber-100"
              >
                <IoChevronBack size={24} />
              </button>
              
              <div className="flex flex-wrap justify-center gap-2 px-10 py-3">
                {categoryGroups[activeGroupIndex].items.map((category, index) => (
                  <button
                    key={index}
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
              
              <button 
                onClick={() => changeGroup('next')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md text-amber-800 hover:bg-amber-100"
              >
                <IoChevronForward size={24} />
              </button>
            </div>

            {/* Group indicator */}
            <div className="flex justify-center mt-2 gap-1">
              {categoryGroups.map((_, index) => (
                <span 
                  key={index} 
                  className={`inline-block w-2 h-2 rounded-full ${index === activeGroupIndex ? 'bg-amber-500' : 'bg-amber-200'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile category sidebar */}
      <MobileCategorySidebar />

      {/* Selected categories display - visible on both mobile and desktop */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategories.map((category, index) => (
            <span key={index} className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full flex items-center">
              {category}
              <button 
                onClick={() => toggleCategorySelection(category)}
                className="ml-2 text-orange-600 hover:text-orange-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Food grid - 2 columns on mobile, 4 on larger screens */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
                className="h-32 sm:h-40 w-full object-cover"
              />
              <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-amber-800 line-clamp-2">{food.name}</h3>
                  <button onClick={() => handleToggleLike(food.id)} className="ml-1 flex-shrink-0">
                    {isLiked ? (
                      <AiFillHeart className="text-red-500 text-xl" />
                    ) : (
                      <AiOutlineHeart className="text-gray-400 text-xl" />
                    )}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{food.business.name}</p>
                
                {/* Hiển thị danh mục - tối đa 2 danh mục + badge "+n" nếu có nhiều hơn */}
                {food.category && food.category.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {food.category.slice(0, 1).map((cat, index) => (
                      <span key={index} className="inline-block bg-orange-50 text-orange-700 text-xs px-2 py-0.5 sm:py-1 rounded-full">
                        {cat}
                      </span>
                    ))}
                    {food.category.length > 1 && (
                      <span className="inline-block bg-orange-50 text-orange-700 text-xs px-2 py-0.5 sm:py-1 rounded-full">
                        +{food.category.length - 1}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="mt-3 sm:mt-4 flex items-center justify-between">
                  <span className="text-orange-600 font-bold text-sm sm:text-base">
                    {food.price.toLocaleString()}đ
                  </span>
                  <button
                    className="text-xs sm:text-sm bg-orange-100 text-orange-800 px-2 sm:px-3 py-1 rounded-full hover:bg-orange-200 transition"
                    onClick={() => setSelectedFood(food)}
                  >
                    Chi tiết
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