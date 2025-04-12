"use client";

import { useEffect, useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { toast } from "react-hot-toast";

type Comment = { id: string; content: string; userId: string };
type Review = { id: string; rating: number; comment: string; userId: string; foodId: string };
type Food = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
  businessId : string;
};

const categories = ["Món ngọt", "Món chay", "Món mặn", "Món cay", "Món chua"];


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
  const router = useRouter();

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

  // Save food data
  const handleSave = async () => {
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

      // Update food data with API
      const res = await fetch(`/api/foods/${food.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editedFood,
          image: imageUrl,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update food');
      }

      // Update local state with new data
      const updatedFood = await res.json();
      
      // Exit edit mode and show success message
      setIsEditing(false);
      setIsSubmitting(false);
      toast.success('Cập nhật thông tin món ăn thành công!');
      
      // Reset file state
      setSelectedFile(null);
      setPreviewImage(null);
      
      // Could refresh the page or update local state here
      // router.refresh(); // if using Next.js App Router

    } catch (error) {
      setIsSubmitting(false);
      toast.error('Có lỗi xảy ra khi cập nhật: ' + (error as Error).message);
    }
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên món ăn</label>
                    <input
                      type="text"
                      value={editedFood.name}
                      onChange={(e) => setEditedFood({...editedFood, name: e.target.value})}
                      className="text-black w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                    <input
                      type="number"
                      value={editedFood.price}
                      onChange={(e) => setEditedFood({...editedFood, price: Number(e.target.value)})}
                      className="text-black w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <select
                        value={editedFood.category || ''}
                        onChange={(e) => setEditedFood({...editedFood, category: e.target.value})}
                        className="text-black w-full p-2 border border-gray-300 rounded-md bg-white"
                    >
                        <option value="" disabled>-- Chọn danh mục --</option>
                        {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                        ))}
                    </select>
                    </div>

                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      value={editedFood.description}
                      onChange={(e) => setEditedFood({...editedFood, description: e.target.value})}
                      className="text-black w-full p-2 border border-gray-300 rounded-md"
                      rows={4}
                    />
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
                  
                  {editedFood.category && (
                    <p className="text-gray-600 mb-2">📂 Danh mục: {editedFood.category}</p>
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
                  onClick={() => {
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
                    setSelectedFile(null);
                    setPreviewImage(null);
                  }}
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