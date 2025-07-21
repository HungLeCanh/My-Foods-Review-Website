"use client";

import { useState, useRef, useEffect } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRandom } from "react-icons/fa";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { BiCategoryAlt } from "react-icons/bi";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import FoodDetailModal from "./FoodDetailModal";
import { categories } from "../../../lib/constants/categories";

type Food = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string[];
  business: {
    id: string;
    name: string;
    image: string | null;
    description: string;
    address: string;
    createdAt: string;
    updatedAt: string;
  };
  likes: { userId: string }[];
}

type UserData = {
  id: string;
  name: string;
  email: string;
  image: string;
  likedFoods: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    business: {
      id: string;
      name: string;
      image: string;
    };
    likeId: string;
    likedAt: string;
  }[];
};

export default function FoodSearchPage() {
  const { data: session, status } = useSession();
  const [sessionStatus, setStatus] = useState("loading");
  const [sessionData, setSession] = useState<UserData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const userId = sessionData?.id || "";
  
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
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

  // Fetch session và user data
  useEffect(() => {
    const fetchSessionAndUserData = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        
        if (sessionRes.status === 401) {
          setStatus("unauthenticated");
          setSession(null);
        } else {
          const sessionData = await sessionRes.json();
          setSession(sessionData.session);
          setStatus("authenticated");
          
          // Fetch user data nếu authenticated
          try {
            const userRes = await fetch("/api/users/me");
            const userData = await userRes.json();
            setUserData(userData);
            
            // Kiểm tra role business và xử lý
            if (sessionData.session?.user?.role === "business") {
              toast.error("Bạn đang đăng nhập bằng tài khoản doanh nghiệp. Xin hãy đăng nhập bằng tài khoản khách hàng để thực hiện các chức năng.", {
                duration: 5000,
              });
              setTimeout(() => {
                signOut({ redirect: true, callbackUrl: "/pages/login" });
              }, 2000);
            }
          } catch (userError) {
            console.error("Lỗi khi fetch user data:", userError);
          }
        }
      } catch (error) {
        console.error("Lỗi khi fetch session:", error);
        setStatus("unauthenticated");
      }
    };

    fetchSessionAndUserData();
  }, []);

  // Fetch foods data
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/foods');
        if (!response.ok) {
          throw new Error('Failed to fetch foods');
        }
        const data = await response.json();
        setFoods(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

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

  // Helper function để check xem món ăn có được like không dựa trên userData.likedFoods
  const isFoodLiked = (foodId: string): boolean => {
    if (!userData || !userData.likedFoods) return false;
    return userData.likedFoods.some(likedFood => likedFood.id === foodId);
  };

  const handleToggleLike = async (foodId: string) => {
    if (!userId) {
      alert("Bạn không thể thực hiện thao tác này hãy thử đăng nhập.");
      return;
    }

    const isCurrentlyLiked = isFoodLiked(foodId);

    try {
      if (isCurrentlyLiked) {
        // Unlike - tìm likeId từ userData.likedFoods
        const likedFood = userData?.likedFoods.find(lf => lf.id === foodId);
        if (likedFood) {
          await fetch("/api/likes", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userId, foodId }),
          });

          // Cập nhật userData để loại bỏ món ăn khỏi likedFoods
          setUserData(prev => prev ? {
            ...prev,
            likedFoods: prev.likedFoods.filter(lf => lf.id !== foodId)
          } : null);
        }
      } else {
        // Like
        await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userId, foodId }),
        });

        // Tìm thông tin món ăn để thêm vào likedFoods
        const foodToLike = foods.find(f => f.id === foodId);
        if (foodToLike && userData) {
          const newLikedFood = {
            id: foodToLike.id,
            name: foodToLike.name,
            description: foodToLike.description,
            price: foodToLike.price,
            image: foodToLike.image || "",
            category: Array.isArray(foodToLike.category) ? foodToLike.category.join(", ") : "",
            business: {
              id: foodToLike.business.id,
              name: foodToLike.business.name,
              image: foodToLike.business.image || ""
            },
            likeId: `temp-${Date.now()}`, // Temporary ID
            likedAt: new Date().toISOString()
          };

          // Cập nhật userData để thêm món ăn vào likedFoods
          setUserData(prev => prev ? {
            ...prev,
            likedFoods: [...prev.likedFoods, newLikedFood]
          } : null);
        }
      }

      // Cũng cập nhật state foods để đồng bộ với UI cũ (nếu cần)
      setFoods((prev) =>
        prev.map((f) =>
          f.id === foodId
            ? {
                ...f,
                likes: isCurrentlyLiked
                  ? f.likes.filter((l) => l.userId !== userId)
                  : [...f.likes, { userId: userId }],
              }
            : f
        )
      );

    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Có lỗi xảy ra khi thực hiện thao tác");
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
    const categoryString = Array.isArray(food.category) ? food.category.join(", ") : "";
    const matchesSearch = 
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      food.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryString.toLowerCase().includes(searchTerm.toLowerCase()) || 
      food.business.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Lọc theo danh mục đã chọn - hiển thị món ăn nếu nó có ít nhất một danh mục trong số danh mục được chọn
    const matchesCategory = selectedCategories.length === 0 || 
      (Array.isArray(food.category) && selectedCategories.some(selectedCat => food.category.includes(selectedCat)));
    
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
                    ${showMobileSidebar ? 'translate-x-0' : 'translate-full'}`}
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
              {categoryGroups[activeGroupIndex].items.map((category: string, index: number) => (
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

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách món ăn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Lỗi: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-800 mb-2">Tìm kiếm món ăn</h1>
        <p className="text-gray-600">Khám phá những món ăn ngon từ các cửa hàng địa phương</p>
      </div>

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

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Tìm thấy {filteredFoods.length} món ăn
          {selectedCategories.length > 0 && ` với ${selectedCategories.length} danh mục đã chọn`}
          {searchTerm && ` cho từ khóa "${searchTerm}"`}
        </p>
      </div>

      {/* Food grid - 2 columns on mobile, 4 on larger screens */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {filteredFoods.map((food) => {
          // Sử dụng function mới để check like status
          const isLiked = isFoodLiked(food.id);
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
                
                {/* Hiển thị danh mục - tối đa 1 danh mục + badge "+n" nếu có nhiều hơn */}
                {food.category && Array.isArray(food.category) && food.category.length > 0 && (
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
        {filteredFoods.length === 0 && !loading && (
          <div className="text-center col-span-full py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg font-medium mb-2">
              Không tìm thấy món ăn phù hợp
            </p>
            <p className="text-gray-500 text-sm">
              Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn một số danh mục
            </p>
          </div>
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