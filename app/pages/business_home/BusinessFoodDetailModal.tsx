"use client";

import { useEffect, useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { Camera, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import { categories } from "../../lib/constants/categories";


type Comment = { id: string; content: string; userId: string };
type Review = { id: string; rating: number; comment: string; userId: string; foodId: string };
type Food = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
  businessId: string;
};

export default function BusinessFoodDetailModal({
  food,
  onClose,
}: {
  food: Food;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"comments" | "reviews">("comments");
  const [comments, setComments] = useState<Comment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // Quản lý các danh mục đã chọn
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Food data state for editing
  const [editedFood, setEditedFood] = useState<Food>({
    id: food.id,
    name: food.name,
    description: food.description,
    price: food.price,
    image: food.image,
    category: food.category,
    businessId: food.businessId
  });

  // Split category string into array when component mounts
  useEffect(() => {
    if (food.category) {
      const categoryArray = food.category.split(", ").filter(cat => cat.trim());
      setSelectedCategories(categoryArray);
    }
  }, [food.category]);

  // Fetch data for comments and reviews when modal opens
  useEffect(() => {
    const fetchData = async () => {
      const commentRes = await fetch(`/api/comments?foodId=${food.id}`);
      const reviewRes = await fetch(`/api/reviews?foodId=${food.id}`);
  
      const commentsData = await commentRes.json();
      const reviewsData = await reviewRes.json();
  
      setComments(commentsData);
      setReviews(reviewsData);
      
      // Calculate average rating
      if (reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum: number, review: Review) => sum + review.rating, 0);
        setAverageRating(totalRating / reviewsData.length);
      }
    };
  
    fetchData();
  }, [food.id]);

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Clear any error for image field
    if (errors.image) {
      setErrors({ ...errors, image: "" });
    }
  };

  // Upload image to Cloudinary
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error uploading image');
    }

    return data.url;
  };

  // Delete old image from Cloudinary
  const deleteOldImage = async (imageUrl: string) => {
    try {
      await fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting old image:', error);
    }
  };

  // Validate form before saving
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!editedFood.name.trim()) newErrors.name = "Vui lòng nhập tên món";
    if (!editedFood.description.trim()) newErrors.description = "Vui lòng nhập mô tả";
    if (!editedFood.price) newErrors.price = "Vui lòng nhập giá";
    else if (editedFood.price <= 0) newErrors.price = "Giá phải lớn hơn 0";
    if (selectedCategories.length === 0)
      newErrors.category = "Vui lòng chọn ít nhất một danh mục";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save food data
  const handleSave = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      let imageUrl = editedFood.image;

      // Handle image upload if a new file is selected
      if (selectedFile) {
        // Delete old image if exists
        if (food.image) {
          await deleteOldImage(food.image);
        }
        // Upload new image
        imageUrl = await uploadImage(selectedFile);
      }

      // Join selected categories into a comma-separated string
      const categoryString = selectedCategories.join(", ");

      // Update food data with API
      const res = await fetch(`/api/foods`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editedFood,
          image: imageUrl,
          category: categoryString,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update food');
      }

      // Update local state with new data
      const updatedFood = await res.json();
      setEditedFood({
        ...updatedFood,
        category: categoryString
      });
      
      // Exit edit mode and show success message
      setIsEditing(false);
      setIsSubmitting(false);
      toast.success('Cập nhật thông tin món ăn thành công!');
      
      // Reset file state
      setSelectedFile(null);
      setPreviewImage(null);

    } catch (error) {
      setIsSubmitting(false);
      toast.error('Có lỗi xảy ra khi cập nhật: ' + (error as Error).message);
    }
  };

  // Reset form to original values when canceling edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedFood({
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      image: food.image,
      category: food.category,
      businessId: food.businessId
    });
    
    // Reset categories to original state
    if (food.category) {
      const categoryArray = food.category.split(", ").filter(cat => cat.trim());
      setSelectedCategories(categoryArray);
    } else {
      setSelectedCategories([]);
    }
    
    // Clear file selection
    setSelectedFile(null);
    setPreviewImage(null);
    
    // Clear errors
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-4 border-b">
          <h2 className="text-2xl font-bold text-amber-700">
            {isEditing ? 'Chỉnh sửa món ăn' : food.name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-xl">✖</button>
        </div>
  
        {/* Main content */}
        <div className="flex flex-col md:flex-row">
          {/* Left side - Food information */}
          <div className="md:w-1/2 p-6 border-r">
            {/* Food image */}
            <div className="relative">
              <img
                src={previewImage || editedFood.image || '/placeholder-food.jpg'}
                alt={editedFood.name}
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
              
              {isEditing && (
                <div className="absolute bottom-6 right-2">
                  <label className="cursor-pointer bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                    <Camera size={24} className="text-amber-600" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}
            </div>
            
            {/* Food info */}
            <div className="mb-4 p-3 bg-orange-50 rounded-lg">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên món ăn <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={editedFood.name}
                      onChange={(e) => {
                        setEditedFood({...editedFood, name: e.target.value});
                        if (errors.name) setErrors({...errors, name: ""});
                      }}
                      className={`text-black w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        value={editedFood.price}
                        onChange={(e) => {
                          setEditedFood({...editedFood, price: Number(e.target.value)});
                          if (errors.price) setErrors({...errors, price: ""});
                        }}
                        className={`text-black w-full p-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500">VNĐ</span>
                      </div>
                    </div>
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    <p className="text-gray-500 text-xs flex items-center mt-1">
                      <Info size={12} className="mr-1" /> Nhập giá không cần dấu phẩy hoặc chấm
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pb-2">
                      {categories.map((name) => {
                        const selected = selectedCategories.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              setSelectedCategories(prev =>
                                selected ? prev.filter(c => c !== name) : [...prev, name]
                              );
                              if (errors.category) {
                                setErrors({ ...errors, category: "" });
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors
                              ${selected
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}
                            `}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả <span className="text-red-500">*</span></label>
                    <textarea
                      value={editedFood.description}
                      onChange={(e) => {
                        setEditedFood({...editedFood, description: e.target.value});
                        if (errors.description) setErrors({...errors, description: ""});
                      }}
                      className={`text-black w-full p-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                      rows={4}
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-orange-600 font-bold text-xl">{editedFood.price.toLocaleString()}đ</p>
                    {averageRating > 0 && (
                      <div className="flex items-center">
                        <span className="text-yellow-500 font-medium mr-1">{averageRating.toFixed(1)}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>
                              {i < Math.round(averageRating) ? (
                                <AiFillStar className="text-yellow-400" />
                              ) : (
                                <AiOutlineStar className="text-gray-300" />
                              )}
                            </span>
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm ml-1">({reviews.length})</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Show categories */}
                  {selectedCategories.length > 0 && (
                    <div className="mb-3">
                      <p className="text-gray-600 mb-1">📂 Danh mục:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCategories.map((cat) => (
                          <span key={cat} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Mô tả món ăn */}
                  <div className="mt-3">
                    <h3 className="font-medium text-gray-800">Mô tả:</h3>
                    <p className="text-gray-700 mt-1">{editedFood.description}</p>
                  </div>
                </>
              )}
            </div>
  
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  className={`flex-1 py-2 px-4 rounded-full transition ${
                    isSubmitting 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-amber-600 hover:bg-amber-700 text-white"
                  }`}
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-full hover:bg-gray-300 transition"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                className="bg-amber-600 text-white py-2 px-4 rounded-full hover:bg-amber-700 transition w-full"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Chỉnh sửa thông tin
              </button>
            )}
          </div>
  
          {/* Right side - Comments and Reviews */}
          <div className="md:w-1/2 p-6">
            {/* Tabs */}
            <div className="mb-4 flex border-b">
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === "comments" ? "border-b-2 border-orange-600 text-orange-700" : "text-gray-600"
                }`}
                onClick={() => setActiveTab("comments")}
              >
                💬 Bình luận ({comments.length})
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === "reviews" ? "border-b-2 border-orange-600 text-orange-700" : "text-gray-600"
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                ⭐ Đánh giá ({reviews.length})
              </button>
            </div>
  
            {/* Tab Content */}
            <div className="overflow-y-auto max-h-[500px]">
              {activeTab === "comments" ? (
                <div className="space-y-3">
                  {comments.map((cmt) => (
                    <div key={cmt.id} className="border p-3 rounded-lg bg-gray-50">
                      <p className="font-semibold text-sm text-gray-700">👤 Người dùng: {cmt.userId}</p>
                      <p className="mt-1 text-gray-800">{cmt.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && <p className="text-gray-500 text-sm">Chưa có bình luận nào.</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="border p-3 rounded-lg bg-gray-50">
                      <p className="font-semibold text-sm text-gray-700">👤 Người dùng: {rev.userId}</p>
                      <div className="flex space-x-1 mb-1">
                        {[...Array(rev.rating)].map((_, i) => (
                          <AiFillStar key={i} className="text-yellow-400 text-sm" />
                        ))}
                        {[...Array(5 - rev.rating)].map((_, i) => (
                          <AiOutlineStar key={i} className="text-gray-300 text-sm" />
                        ))}
                      </div>
                      <p className="text-gray-800">{rev.comment}</p>
                    </div>
                  ))}
                  {reviews.length === 0 && <p className="text-gray-500 text-sm">Chưa có đánh giá nào.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}