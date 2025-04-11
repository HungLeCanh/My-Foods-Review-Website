"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
type UserAccountProps = {
  session: {
    user: {
      name: string;
      email: string;
      image: string | null;
      id: string;
      role: string;
    }
  };
  onUpdateSuccess?: () => void;
};

type UserData = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  likedFoods: any[];
};

export default function AccountSection({ session,  onUpdateSuccess }: UserAccountProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy thông tin người dùng
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setFormData({
            name: data.name || "",
            email: data.email || "",
          });
        } else {
          toast.error("Không thể tải thông tin người dùng");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        toast.error("Đã xảy ra lỗi khi tải thông tin");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session?.user?.id]);

  // Xử lý upload ảnh đại diện
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      return null;
    }
  };

  // Xử lý xóa ảnh cũ
  const deleteOldImage = async (imageUrl: string) => {
    try {
      const response = await fetch(`/api/upload?url=${imageUrl}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        console.error("Không thể xóa ảnh cũ");
      }
    } catch (error) {
      console.error("Lỗi khi xóa ảnh cũ:", error);
    }
  };

  // Xử lý khi chọn file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Kiểm tra loại tệp
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        toast.error("Chỉ chấp nhận tệp hình ảnh (JPEG, PNG, GIF)");
        return;
      }
      
      // Kiểm tra kích thước tệp (giới hạn 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước tệp không được vượt quá 5MB");
        return;
      }

      setSelectedFile(file);
      
      // Tạo URL xem trước
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý khi thay đổi dữ liệu form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý khi submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = userData?.image;
      
      // Upload ảnh mới nếu có
      if (selectedFile) {
        const newImageUrl = await uploadImage(selectedFile);
        
        if (newImageUrl) {
          // Xóa ảnh cũ nếu có
          if (userData?.image) {
            await deleteOldImage(userData.image);
          }
          imageUrl = newImageUrl;
        } else {
          toast.error("Không thể tải lên ảnh đại diện");
          setIsSubmitting(false);
          return;
        }
      }

      // Cập nhật thông tin người dùng
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          image: imageUrl,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
        toast.success("Cập nhật thông tin thành công");
        setIsEditing(false);
        
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Cập nhật thông tin thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Huỷ chỉnh sửa
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: userData?.name || "",
      email: userData?.email || "",
    });
    setSelectedFile(null);
    setPreviewImage(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto"></div>
          <p className="mt-4 text-amber-800">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <div className="text-6xl mb-5">⚠️</div>
        <h2 className="text-2xl font-semibold text-amber-800 mb-3">
          Không thể tải thông tin tài khoản
        </h2>
        <p className="text-amber-700 mb-4">
          Vui lòng thử lại sau hoặc liên hệ hỗ trợ
        </p>
        <button
          className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-amber-500 transition-all"
          onClick={() => router.refresh()}
        >
          Tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Thông tin tài khoản</h1>
          <p className="opacity-90">Quản lý thông tin cá nhân của bạn</p>
        </div>

        {/* Nội dung */}
        <div className="p-6 md:p-8">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar upload */}
              <div className="flex flex-col items-center md:items-start md:flex-row md:space-x-6">
                <div className="relative mb-4 md:mb-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-200 shadow-md bg-amber-50">
                    <img
                      src={previewImage || (userData.image ? userData.image : "/uploads/default-avatar.jpg")}
                      alt="Ảnh đại diện"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 bg-amber-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-amber-500 transition-all"
                  >
                    <Camera size={20} strokeWidth={2} />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 w-full">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-amber-800 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-black w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                      placeholder="Nhập họ và tên của bạn"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-amber-800 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="text-black w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Nút điều khiển */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-amber-600 text-amber-600 rounded-full hover:bg-amber-50 transition-all"
                  disabled={isSubmitting}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-500 transition-all flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex flex-col md:flex-row">
                <div className="md:mr-8 mb-6 md:mb-0 flex justify-center md:justify-start">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-200 shadow-md">
                    <img
                      src={userData.image ? userData.image : "/uploads/default-avatar.jpg"}
                      alt="Ảnh đại diện"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-amber-800">{userData.name}</h2>
                      <p className="text-amber-600">{userData.email}</p>
                    </div>
                    
                    <div className="border-t border-amber-100 pt-4">
                      <h3 className="text-lg font-medium text-amber-800 mb-2">Thông tin tài khoản</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-amber-50 p-4 rounded-lg">
                          <p className="text-sm text-amber-500">ID tài khoản</p>
                          <p className="font-medium text-amber-800">{userData.id}</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg">
                          <p className="text-sm text-amber-500">Số món yêu thích</p>
                          <p className="font-medium text-amber-800">{userData.likedFoods?.length || 0} món</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-500 transition-all"
                    >
                      Chỉnh sửa thông tin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Phần món ăn yêu thích gần đây */}
      {userData.likedFoods && userData.likedFoods.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">Món ăn yêu thích gần đây</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userData.likedFoods.slice(0, 3).map((food) => (
              <div key={food.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={food.image ? food.image : "/uploads/default-food.jpg"}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 p-2">
                    <span className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                      ❤️
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-amber-800">{food.name}</h3>
                  <p className="text-amber-600 text-sm">{food.business?.name}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="font-medium text-amber-800">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(food.price)}</p>
                    <p className="text-xs text-amber-500">
                      {new Date(food.likedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {userData.likedFoods.length > 3 && (
            <div className="text-center mt-4">
              <button
                onClick={() => router.push("/favorites")}
                className="text-amber-600 hover:text-amber-500 font-medium"
              >
                Xem tất cả {userData.likedFoods.length} món yêu thích
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}