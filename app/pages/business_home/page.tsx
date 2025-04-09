"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Business, Food } from "@prisma/client";
import AddFoodForm from "./AddFoodForm";
import { signOut } from "next-auth/react";

const categories = ["Món ngọt", "Món chay", "Món mặn", "Món cay", "Món chua"];

export default function BusinessHome() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", image: "", address: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);
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
          image: data.business?.image || "",
          address: data.business?.address || "",
        });
        
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/businesses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Cập nhật thất bại");
      
      // Kiểm tra component còn mounted không trước khi update state
      if (!isMounted.current) return;
      
      const updatedBusiness = await response.json();
      setBusiness(updatedBusiness);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating business:", error);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!business && !isLoading) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500">Không thể tải thông tin doanh nghiệp. Vui lòng đăng nhập lại.</p>
        <button
          onClick={handleLogout}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Quay lại trang đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header with logout button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý nhà hàng</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200 flex items-center"
        >
          <span className="mr-1">🚪</span> Đăng xuất
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Tên doanh nghiệp"
              className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Mô tả"
              className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none min-h-24"
            />
            <input
              name="image"
              type="file"
              accept="image/*"
              value={form.image}
              onChange={handleChange}
              placeholder="URL ảnh"
              className="border border-gray-300 p-2 w-full rounded-md"
            />
            <input
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder="Địa chỉ"
              className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 flex-1"
              >
                Lưu thay đổi
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200 flex-1"
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
<div>
  <div className="flex flex-col md:flex-row items-center gap-6">
    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
      <Image
        src={business?.image ? `/uploads/${business.image}` : "/uploads/default-avatar.jpg"}
        alt={business?.name || 'Không có dữ liệu'}
        width={128}
        height={128}
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
  
      <div className="mb-4 border-b border-gray-200 pb-2">
        <h2 className="text-2xl font-bold text-gray-800">Danh sách món ăn</h2>
      </div>
      
      {foods.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chưa có món ăn nào trong menu</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
          >
            Thêm món ăn đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {foods.map((food) => (
            <div key={food.id} className="bg-white shadow-md rounded-lg overflow-hidden h-full flex flex-col">
              <div className="h-48 overflow-hidden">
                <Image
                  src={food.image ? `/uploads/${food.image}` : "/uploads/default-food.jpg"}
                  alt={food.name}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800">{food.name}</h3>
                <p className="text-gray-500 mt-2 flex-1">{food.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-red-500 font-bold text-lg">{food.price.toFixed(2)} VNĐ</p>
                  <button className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 transition duration-200 text-sm">
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );  
}