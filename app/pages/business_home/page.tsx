"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Business, Food } from "@prisma/client";
import AddFoodForm from "./AddFoodForm";
import { signOut } from "next-auth/react";
import { Camera } from "lucide-react";

const categories = ["Món ngọt", "Món chay", "Món mặn", "Món cay", "Món chua"];

export default function BusinessHome() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", address: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const isMounted = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Thiết lập isMounted là true khi component mount
    isMounted.current = true;
    
    const fetchBusiness = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/businesses/me", { cache: "no-store" });
        
        // Kiểm tra nếu component đã unmount thì không cập nhật state
        if (!isMounted.current) return;
        
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu doanh nghiệp");
        }
        
        const data = await response.json();
        
        // Kiểm tra lại trước khi cập nhật state
        if (!isMounted.current) return;
        
        setBusiness(data.business);
        setForm({
          name: data.business?.name || "",
          description: data.business?.description || "",
          address: data.business?.address || "",
        });
        
        // Thiết lập preview image từ business data
        if (data.business?.image) {
          setPreviewImage(data.business.image);
        }
        
        // Tách phần gọi API foods ra thành một hàm riêng
        await fetchFoods();
      } catch (error) {
        console.error("Error fetching business data:", error);
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };
    
    const fetchFoods = async () => {
      try {
        const foodsResponse = await fetch("/api/foods/business");
        
        // Kiểm tra lại trước khi xử lý response
        if (!isMounted.current) return;
        
        if (foodsResponse.ok) {
          const foodsData = await foodsResponse.json();
          setFoods(foodsData);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching foods data:", error);
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchBusiness();
    
    // Cleanup function để đánh dấu component đã unmount
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Tạo URL preview cho file ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    const formData = new FormData();
    formData.append('file', imageFile);
    
    // Thêm thông tin về ảnh cũ nếu cần xoá
    if (business?.image) {
      formData.append('oldImage', business.image);
    }
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload ảnh thất bại');
      }
      
      const data = await response.json();
      return data.filename; // Trả về tên file đã upload
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Upload ảnh nếu có thay đổi
      let imageFilename = business?.image || "";
      if (imageFile) {
        const uploadedImageName = await uploadImage();
        if (uploadedImageName) {
          imageFilename = uploadedImageName;
        }
      }
      
      const response = await fetch("/api/businesses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          image: imageFilename
        }),
      });

      if (!response.ok) throw new Error("Cập nhật thất bại");
      
      // Kiểm tra component còn mounted không trước khi update state
      if (!isMounted.current) return;
      
      const updatedBusiness = await response.json();
      setBusiness(updatedBusiness);
      setEditMode(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating business:", error);
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLogout = async () => {
    try {
      // Đánh dấu component sẽ unmount
      isMounted.current = false;
      await signOut({ redirect: false });
      router.push("/pages/login");
    } catch (error) {
      console.error("Error during logout:", error);
      // Nếu có lỗi, đặt lại isMounted để tiếp tục sử dụng
      isMounted.current = true;
    }
  };

  const filteredFoods = categoryFilter 
    ? foods.filter(food => food.category === categoryFilter)
    : foods;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!business && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-500 font-medium mb-4">Không thể tải thông tin doanh nghiệp. Vui lòng đăng nhập lại.</p>
          <button
            onClick={handleLogout}
            className="w-full mt-4 bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition duration-200 font-medium"
          >
            Quay lại trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header with logout button */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý nhà hàng</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200 flex items-center font-medium"
        >
          <span className="mr-1">🚪</span> Đăng xuất
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40 mb-2">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-gray-200">
                    <Image
                      src={previewImage || "/uploads/default-avatar.jpg"}
                      alt="Avatar preview"
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleTriggerFileInput}
                    className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-md"
                  >
                    <Camera size={20} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500 text-center">Nhấp vào biểu tượng máy ảnh để thay đổi ảnh</p>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên nhà hàng</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tên doanh nghiệp"
                    className="text-black border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Mô tả"
                    className="text-black border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none min-h-24"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Địa chỉ"
                    className="text-black border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setPreviewImage(business?.image ? business.image : null);
                }}
                className="bg-gray-300 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-400 transition duration-200 font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition duration-200 font-medium flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                <Image
                  src={business?.image ? business.image : "/uploads/default-avatar.jpg"}
                  alt={business?.name || 'Không có dữ liệu'}
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-800">{business?.name || 'Không có dữ liệu'}</h1>
                <p className="text-gray-600 mt-2">{business?.description || 'Không có mô tả'}</p>
                <p className="text-gray-500 flex items-center justify-center md:justify-start mt-2">
                  <span className="text-xl mr-1">📍</span> {business?.address || 'Không có địa chỉ'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center md:justify-start">
              <button
                onClick={() => setEditMode(true)}
                className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition duration-200 flex items-center justify-center"
              >
                <span className="mr-1">✏️</span> Chỉnh sửa thông tin
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 flex items-center justify-center"
              >
                <span className="mr-1">➕</span> Thêm món vào menu
              </button>
            </div>
          </div>
        )}
      </div>
  
      {showAddForm && (
        <AddFoodForm
          onClose={() => setShowAddForm(false)}
          onFoodAdded={(food : any) => {
            if (isMounted.current) {
              setFoods([...foods, food]);
            }
          }}
          categories={categories}
        />
      )}
  
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Danh sách món ăn</h2>
          
          {/* Category Filter */}
          {foods.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter(null)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === null
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tất cả
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    categoryFilter === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {foods.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <div className="text-gray-400 text-5xl mb-3">🍽️</div>
            <p className="text-gray-500 mb-4">Chưa có món ăn nào trong menu</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition duration-200 font-medium"
            >
              Thêm món ăn đầu tiên
            </button>
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Không có món ăn nào thuộc loại "{categoryFilter}"</p>
            <button
              onClick={() => setCategoryFilter(null)}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Xem tất cả món ăn
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {filteredFoods.map((food) => (
              <div key={food.id} className="bg-white shadow-md rounded-lg overflow-hidden h-full flex flex-col border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden relative group">
                  <Image
                    src={food.image ? food.image : "/uploads/default-food.png"}
                    alt={food.name}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 py-1 px-2 rounded-full text-xs font-medium text-gray-700">
                    {food.category || 'Không phân loại'}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800">{food.name}</h3>
                  <p className="text-gray-500 mt-2 flex-1 text-sm">{food.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-red-500 font-bold text-lg">{food.price.toLocaleString('vi-VN')} VNĐ</p>
                    <button className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 transition duration-200 text-sm flex items-center">
                       Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );  
}