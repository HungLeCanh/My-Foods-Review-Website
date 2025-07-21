"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Auth
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);

  // City
  const [selectedCity, setSelectedCity] = useState("Đà Nẵng");
  const cities = ["Đà Nẵng", "Hà Nội", "Hồ Chí Minh", "Huế"];

  // UI
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [mobileCityDropdownOpen, setMobileCityDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



  // Fetch session và user data
  useEffect(() => {
    if (status !== "authenticated") {
      setUserData(null);
      return;
    }

    if (!session?.user) {
      console.log("Session is authenticated but user is undefined. Waiting...");
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUserData(data);

        if (session.user.role === "business") {
          toast.error("Bạn đang đăng nhập bằng tài khoản doanh nghiệp.");
          setTimeout(() => signOut({ callbackUrl: "/pages/login" }), 2000);
        }
      } catch (err) {
        console.error("Lỗi khi fetch user data:", err);
      }
    };

    fetchUserData();
  }, [session, status]);

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

  const handleTabClick = (path: string) => {
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
    
    router.push(path);
    setMobileMenuOpen(false);
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

  const handleLogoClick = () => {
    router.push("/pages/home/food-search-section");
    setMobileMenuOpen(false);
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center p-10 space-y-4 text-blue-600 animate-pulse">
        <svg
          className="w-12 h-12 text-blue-500 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        <p className="text-lg font-medium">Đang kiểm tra phiên đăng nhập...</p>
        <p className="text-sm text-gray-500">Vui lòng chờ một chút nhé 😊</p>
      </div>
    );
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
        {/* Logo section */}
        <div onClick={handleLogoClick} className="flex items-center cursor-pointer">
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
              pathname === "/pages/home/food-search-section" ? "bg-white text-amber-700 font-semibold shadow" : "hover:bg-amber-600"
            }`}
            onClick={() => handleTabClick("/pages/home/food-search-section")}
          >
            🍜 Trang chủ
          </button>
          <button
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              pathname === "/pages/home/favorite-section" ? "bg-white text-amber-700 font-semibold shadow" : "hover:bg-amber-600"
            }`}
            onClick={() => handleTabClick("/pages/home/favorite-section")}
          >
            ❤️ Yêu thích
          </button>
          <button
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              pathname === "/pages/home/account-section" ? "bg-white text-amber-700 font-semibold shadow" : "hover:bg-amber-600"
            }`}
            onClick={() => handleTabClick("/pages/home/account-section")}
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
                  src={userData?.image || session.user?.image || "/uploads/default-avatar.jpg"}
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
                  pathname === "/pages/home/food-search-section" ? "bg-white text-amber-700 font-semibold" : "text-white hover:bg-amber-800"
                }`}
                onClick={() => handleTabClick("/pages/home/food-search-section")}
              >
                🍜 Trang chủ
              </button>
              <button
                className={`px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  pathname === "/pages/home/favorite-section" ? "bg-white text-amber-700 font-semibold" : "text-white hover:bg-amber-800"
                }`}
                onClick={() => handleTabClick("/pages/home/favorite-section")}
              >
                ❤️ Yêu thích
              </button>
              <button
                className={`px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  pathname === "/pages/home/account-section" ? "bg-white text-amber-700 font-semibold" : "text-white hover:bg-amber-800"
                }`}
                onClick={() => handleTabClick("/pages/home/account-section")}
              >
                👤 Tài khoản
              </button>
            </div>
            
            {/* City selector in mobile menu */}
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
                      src={userData?.image || session.user?.image || "/uploads/default-avatar.jpg"}
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
      <div className="pt-16 flex-grow">
        {children}
      </div>
    </div>
  );
}