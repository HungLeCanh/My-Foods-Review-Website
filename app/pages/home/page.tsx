"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import FoodSearchSection from "./FoodSearchSection";
import FavoritesSection from "./FavoritesSection";
import AccountSection from "./AccountSection";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast"; // Import toast để hiển thị thông báo

// type Food = {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   image?: string;
//   business: { 
//     id: string;
//     name: string;
//     image: string | null; 
//   };
//   likes: { userId: string }[]; // danh sách người đã thích
//   category: string;
// };

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

export default function HomePage() {
  const router = useRouter();
  // Auth
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  // City
  const [selectedCity, setSelectedCity] = useState("Đà Nẵng");
  const cities = ["Đà Nẵng", "Hà Nội", "Hồ Chí Minh", "Huế"];

  // Data
  const [foods, setFoods] = useState<fixedFood[]>([]);
  const [likedFoods, setLikedFoods] = useState<LikedFood[]>([]);
  const [userData, setUserData] = useState<any>(null);

  // UI
  const [activeTab, setActiveTab] = useState("home");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [mobileCityDropdownOpen, setMobileCityDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);




  // Lấy session từ custom API và foods theo city
  useEffect(() => {
    const fetchSessionAndFoods = async () => {
      try {
        const [sessionRes, foodsRes, ] = await Promise.all([
          fetch("/api/auth/session"),
          fetch(`/api/foods?city=${selectedCity}`),
        ]);
  
        if (sessionRes.status === 401) {
          setStatus("unauthenticated");
          setSession(null);
        } else {
          const sessionData = await sessionRes.json();
          const userRes = await fetch("/api/users/me");
          const data = await userRes.json();
          setSession(sessionData.session);
          setStatus("authenticated");
          setUserData(data);
          
          // Kiểm tra nếu user có role là business thì hiển thị thông báo và đăng xuất
          if (sessionData.session?.user?.role === "business") {
            toast.error("Bạn đang đăng nhập bằng tài khoản doanh nghiệp. Xin hãy đăng nhập bằng tài khoản khách hàng để thực hiện các chức năng.", {
              duration: 5000,
            });
            // Đăng xuất và chuyển hướng về trang đăng nhập
            setTimeout(() => {
              signOut({ redirect: true, callbackUrl: "/pages/login" });
            }, 2000);
          }
        }
  
        const foodsData = await foodsRes.json();
        const transformedFoods = foodsData.map((food: { category: string; }) => ({
          ...food,
          category: typeof food.category === "string"
            ? food.category.split(",").map(c => c.trim())
            : food.category
        }));
        setFoods(transformedFoods);
      } catch (error) {
        console.error("Lỗi khi fetch session hoặc foods:", error);
      }
    };
  
    fetchSessionAndFoods();
  }, [selectedCity]); // Reload foods khi thay đổi thành phố

    // Dropdown logic cho user avatar
    useEffect(() => {
      const dropdownRef = { current: document.getElementById("user-dropdown") };
      const avatarButtonRef = { current: document.getElementById("avatar-button") };
  
      const handleClickOutside = (event: Event) => {
        if (
          dropdownOpen &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          avatarButtonRef.current &&
          !avatarButtonRef.current.contains(event.target as Node)
        ) {
          setDropdownOpen(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [dropdownOpen]);
  
    // Dropdown logic cho city selector
    useEffect(() => {
      const cityDropdownRef = { current: document.getElementById("city-dropdown") };
      const cityButtonRef = { current: document.getElementById("city-button") };
  
      const handleClickOutside = (event: Event) => {
        if (
          cityDropdownOpen &&
          cityDropdownRef.current &&
          !cityDropdownRef.current.contains(event.target as Node) &&
          cityButtonRef.current &&
          !cityButtonRef.current.contains(event.target as Node)
        ) {
          setCityDropdownOpen(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [cityDropdownOpen]);
    
    // Dropdown logic cho city selector mobile
    useEffect(() => {
      const mobileCityDropdownRef = { current: document.getElementById("mobile-city-dropdown") };
      const mobileCityButtonRef = { current: document.getElementById("mobile-city-button") };
  
      const handleClickOutside = (event: Event) => {
        if (
          mobileCityDropdownOpen &&
          mobileCityDropdownRef.current &&
          !mobileCityDropdownRef.current.contains(event.target as Node) &&
          mobileCityButtonRef.current &&
          !mobileCityButtonRef.current.contains(event.target as Node)
        ) {
          setMobileCityDropdownOpen(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [mobileCityDropdownOpen]);
  
    // Đóng mobile menu khi thay đổi kích thước màn hình
    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth >= 1024) {
          setMobileMenuOpen(false);
        }
      };
  
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);  

  // Fetch danh sách món đã thích
  const fetchLikedFoods = async () => {
    setLikedFoods(userData.likedFoods)
  };

  // Xử lý khi bỏ thích món ăn
  const handleUnlike = (foodId: string) => {
    setLikedFoods(prev => prev.filter(food => food.id !== foodId));
    
    // Cập nhật trạng thái like trong danh sách foods
    setFoods(prev => 
      prev.map(food => {
        if (food.id === foodId) {
          return {
            ...food,
            likes: food.likes.filter(like => like.userId !== session?.user?.id)
          };
        }
        return food;
      })
    );
  };


  const handleTabClick = (tab: string) => {
    // Kiểm tra role trước khi chuyển tab
    if (session?.user?.role === "business") {
      toast.error("Bạn đang đăng nhập bằng tài khoản doanh nghiệp. Xin hãy đăng nhập bằng tài khoản khách hàng để thực hiện các chức năng.", {
        duration: 5000,
      });
      setTimeout(() => {
        signOut({ redirect: true, callbackUrl: "/pages/login" });
      }, 2000);
      return;
    }
    
    setActiveTab(tab);
    setMobileMenuOpen(false); // Đóng menu mobile sau khi chọn tab
    
    // Nếu đã đăng nhập và chọn tab yêu thích, cập nhật danh sách yêu thích
    if (tab === "favorites" && status === "authenticated") {
      fetchLikedFoods();
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const toggleCityDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCityDropdownOpen(!cityDropdownOpen);
  };
  
  const toggleMobileCityDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMobileCityDropdownOpen(!mobileCityDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleCitySelect = (city: string) => {
    // Kiểm tra role trước khi thay đổi thành phố
    if (session?.user?.role === "business") {
      toast.error("Bạn đang đăng nhập bằng tài khoản doanh nghiệp. Xin hãy đăng nhập bằng tài khoản khách hàng để thực hiện các chức năng.", {
        duration: 5000,
      });
      setTimeout(() => {
        signOut({ redirect: true, callbackUrl: "/pages/login" });
      }, 2000);
      return;
    }
    
    setSelectedCity(city);
    setCityDropdownOpen(false);
    setMobileCityDropdownOpen(false);
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut({ redirect: true, callbackUrl: "/pages/home" });
  };

  const handleLoginClick = () => {
    router.push("/pages/login");
    setMobileMenuOpen(false);
  };

  // Loading state
  if (status === "loading") {
    return <div className="text-center p-8">Đang kiểm tra phiên đăng nhập...</div>;
  }

  // Kiểm tra nếu là tài khoản doanh nghiệp thì hiển thị thông báo
  if (status === "authenticated" && session?.user?.role === "business") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 p-4">
        <Toaster position="top-center" />
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-6xl mb-5">🏪</div>
          <h2 className="text-2xl font-semibold text-amber-800 mb-4">
            Tài khoản doanh nghiệp
          </h2>
          <p className="text-gray-700 mb-6">
            Bạn đang đăng nhập bằng tài khoản doanh nghiệp. Xin hãy đăng nhập bằng tài khoản khách hàng để thực hiện các chức năng.
          </p>
          <button
            className="w-full bg-yellow-400 text-amber-900 px-6 py-3 rounded-lg font-semibold shadow hover:bg-yellow-300 transition-all"
            onClick={handleSignOut}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-orange-50">
      <Toaster position="top-center" />
      
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-amber-700 text-white px-4 md:px-6 py-3 flex justify-between items-center shadow-md">
        {/* Logo section sau này thiết kế logo sau */}
        <div className="flex items-center">
          <span className="text-xl font-bold">🍜 FoodPin 📍</span>
        </div>

        {/* Mobile menu button */}
        <button 
          className="lg:hidden text-white focus:outline-none"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
        
        {/* Desktop navigation */}
        <div className="hidden lg:flex items-center justify-center space-x-4">
          <button
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              activeTab === "home" ? "bg-white text-amber-700 font-semibold shadow" : "hover:bg-amber-600"
            }`}
            onClick={() => handleTabClick("home")}
          >
            🍜 Trang chủ
          </button>
          <button
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              activeTab === "favorites" ? "bg-white text-amber-700 font-semibold shadow" : "hover:bg-amber-600"
            }`}
            onClick={() => handleTabClick("favorites")}
          >
            ❤️ Yêu thích
          </button>
          <button
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              activeTab === "account" ? "bg-white text-amber-700 font-semibold shadow" : "hover:bg-amber-600"
            }`}
            onClick={() => handleTabClick("account")}
          >
            👤 Tài khoản
          </button>
          
          {/* City dropdown */}
          <div className="relative ml-4">
            <button 
              id="city-button" 
              onClick={toggleCityDropdown} 
              className="flex items-center px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg transition-all duration-200 focus:outline-none"
            >
              📍 {selectedCity} <span className="ml-2">▼</span>
            </button>
            
            {cityDropdownOpen && (
              <div 
                id="city-dropdown" 
                className="absolute top-full mt-1 w-40 bg-white text-amber-800 shadow-xl rounded-lg overflow-hidden z-40"
              >
                {cities.map((city) => (
                  <button
                    key={city}
                    className={`block px-4 py-2 hover:bg-amber-100 w-full text-left ${
                      city === selectedCity ? "bg-amber-100 font-medium" : ""
                    }`}
                    onClick={() => handleCitySelect(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User profile section (desktop) */}
        <div className="hidden lg:flex items-center">
          {status === "authenticated" && session?.user ? (
            <div className="relative">
              <button id="avatar-button" onClick={toggleDropdown} className="focus:outline-none">
                <img
                  src={session.user?.image ? userData.image : "/uploads/default-avatar.jpg"}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                />
              </button>

              {dropdownOpen && (
                <div
                  id="user-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-white text-amber-800 shadow-xl rounded-lg overflow-hidden z-40"
                >
                  <button
                    className="block px-5 py-3 hover:bg-red-100 w-full text-left text-sm text-red-600"
                    onClick={handleSignOut}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="bg-yellow-400 text-amber-900 px-6 py-2 rounded-full font-semibold shadow hover:bg-yellow-300 transition-all"
              onClick={handleLoginClick}
            >
              🔐 Đăng nhập
            </button>
          )}
        </div>
      </nav>

      {/* Mobile navigation overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-amber-900 bg-opacity-95 lg:hidden">
          <div className="flex flex-col h-full pt-16 px-6 pb-6">
            <div className="flex flex-col space-y-3 mb-6">
              <button
                className={`px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  activeTab === "home" ? "bg-white text-amber-700 font-semibold" : "text-white hover:bg-amber-800"
                }`}
                onClick={() => handleTabClick("home")}
              >
                🍜 Trang chủ
              </button>
              <button
                className={`px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  activeTab === "favorites" ? "bg-white text-amber-700 font-semibold" : "text-white hover:bg-amber-800"
                }`}
                onClick={() => handleTabClick("favorites")}
              >
                ❤️ Yêu thích
              </button>
              <button
                className={`px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  activeTab === "account" ? "bg-white text-amber-700 font-semibold" : "text-white hover:bg-amber-800"
                }`}
                onClick={() => handleTabClick("account")}
              >
                👤 Tài khoản
              </button>
            </div>
            
            {/* City selector in mobile menu - CHANGED TO DROPDOWN */}
            <div className="mb-6">
              <p className="text-white mb-2">Chọn thành phố:</p>
              <div className="relative">
                <button 
                  id="mobile-city-button" 
                  onClick={toggleMobileCityDropdown} 
                  className="flex items-center justify-between w-full px-4 py-3 bg-amber-800 hover:bg-amber-700 text-white rounded-lg focus:outline-none"
                >
                  <span>📍 {selectedCity}</span>
                  <span>▼</span>
                </button>
                
                {mobileCityDropdownOpen && (
                  <div 
                    id="mobile-city-dropdown" 
                    className="absolute top-full left-0 right-0 mt-1 bg-white text-amber-800 shadow-xl rounded-lg overflow-hidden z-40"
                  >
                    {cities.map((city) => (
                      <button
                        key={city}
                        className={`block px-4 py-3 hover:bg-amber-100 w-full text-left ${
                          city === selectedCity ? "bg-amber-100 font-medium" : ""
                        }`}
                        onClick={() => handleCitySelect(city)}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* User actions in mobile menu */}
            <div className="mt-auto">
              {status === "authenticated" && session?.user ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={session.user?.image ? userData.image : "/uploads/default-avatar.jpg"}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                    />
                    <span className="text-white font-medium">
                      {session.user?.name || "Người dùng"}
                    </span>
                  </div>
                  <button
                    className="block px-4 py-3 bg-red-800 hover:bg-red-700 text-white rounded-lg w-full text-left"
                    onClick={handleSignOut}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  className="w-full bg-yellow-400 text-amber-900 px-6 py-3 rounded-lg font-semibold shadow hover:bg-yellow-300 transition-all"
                  onClick={handleLoginClick}
                >
                  🔐 Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="pt-16">
        {/* Nội dung theo tab */}
        <div className="flex-grow">
          {activeTab === "home" && (
            <FoodSearchSection
              userId={session?.user?.id || ""}
              foods={foods}
              setFoods={setFoods}
            />
          )}

          {activeTab === "favorites" && status === "authenticated" && (
            <FavoritesSection 
              userId={session?.user?.id || ""} 
              likedFoods={likedFoods}
              onUnlike={handleUnlike}
            />
          )}
          
          {activeTab === "account" && status === "authenticated" && (
            <AccountSection 
              session={session}
              onUpdateSuccess={() => {
                // Hàm này sẽ được gọi sau khi cập nhật thành công
                // Cập nhật lại session nếu cần
                // fetchSessionData();

                // Phần này không cần nữa sau khi sửa đổi tham số truyền vào
              }}
            />
          )}
          
          {(activeTab === "favorites" || activeTab === "account") && status === "unauthenticated" && (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <div className="text-6xl mb-5">🔒</div>
              <h2 className="text-2xl font-semibold text-amber-800 mb-3">
                Vui lòng đăng nhập để truy cập {activeTab === "favorites" ? "danh sách yêu thích" : "thông tin tài khoản"}
              </h2>
              <button
                className="mt-4 bg-yellow-400 text-amber-900 px-6 py-2 rounded-full font-semibold shadow hover:bg-yellow-300 transition-all"
                onClick={handleLoginClick}
              >
                🔐 Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}