"use client";

import { useEffect, useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { useRouter } from "next/navigation";

type Comment = { id: string; content: string; userId: string };
type Review = { id: string; rating: number; comment: string; userId: string; foodId: string };
type Food = {
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
  category?: string;
};

export default function FoodDetailModal({
  food,
  onClose,
  userId,
}: {
  food: Food;
  userId: string;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"comments" | "reviews">("comments");
  const [comments, setComments] = useState<Comment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const router = useRouter();


  // Fetch dữ liệu comments và reviews khi mở modal
  useEffect(() => {
    const fetchData = async () => {
      const commentRes = await fetch(`/api/comments?foodId=${food.id}`);
      const reviewRes = await fetch(`/api/reviews?foodId=${food.id}`);
  
      const commentsData = await commentRes.json();
      const reviewsData = await reviewRes.json();
  
      setComments(commentsData);
      setReviews(reviewsData);
      
      // Tính điểm đánh giá trung bình
      if (reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum: number, review: Review) => sum + review.rating, 0);
        setAverageRating(totalRating / reviewsData.length);
      }
    };
  
    fetchData();
  }, [food.id]);
  

  const handleSubmitComment = async () => {
    if(!userId){
      alert("Bạn không thể thực hiện thao tác này, hãy đăng nhập để thực hiện chức năng");
      return;
    }
    if (!newComment.trim()) return;

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment, userId, foodId: food.id }),
    });

    const newCmt = await res.json();
    setComments((prev) => [...prev, newCmt]);
    setNewComment("");
  };

  const handleSubmitReview = async () => {
    if(!userId){
      alert("Bạn không thể thực hiện thao tác này, hãy đăng nhập để thực hiện chức năng");
      return;
    }
    if (rating === 0) return;

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment: ratingComment, userId, foodId: food.id }),
    });

    const newReview = await res.json();
    setReviews((prev) => [...prev, newReview]);
    
    // Cập nhật điểm đánh giá trung bình
    const newTotal = reviews.reduce((sum, review) => sum + review.rating, 0) + rating;
    setAverageRating(newTotal / (reviews.length + 1));
    
    setRating(0);
    setRatingComment("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header - vẫn giữ ở trên cùng */}
        <div className="flex justify-between items-start p-4 border-b">
          <h2 className="text-2xl font-bold text-amber-700">{food.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-xl">✖</button>
        </div>
  
        {/* Main content - chia thành 2 phần nằm ngang */}
        <div className="flex flex-col md:flex-row">
          {/* Left side - Chỉ có thông tin món ăn */}
          <div className="md:w-1/2 p-6 border-r">
            {/* Food image */}
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-64 object-cover rounded-xl mb-4"
            />
            
            {/* Food info */}
            <div className="mb-4 p-3 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-orange-600 font-bold text-xl">{food.price.toLocaleString()}đ</p>
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
              
              <p className="text-gray-600 mb-2">🏪 {food.business.name}</p>
              
              {food.category && (
                <p className="text-gray-600 mb-2">📂 Danh mục: {food.category}</p>
              )}
              
              {/* Mô tả món ăn */}
              <div className="mt-3">
                <h3 className="font-medium text-gray-800">Mô tả:</h3>
                <p className="text-gray-700 mt-1">{food.description}</p>
              </div>
            </div>
  
            <button
              className="bg-amber-600 text-white py-2 px-4 rounded-full hover:bg-amber-700 transition w-full"
              onClick={() => {
                router.push(`/pages/business_info?id=${food.business.id}`);
                // onClose(); // đóng modal nếu muốn
              }}
            >
              🚪 Truy cập cửa hàng
            </button>

          </div>
  
          {/* Right side - Tabs and content */}
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
  
            {/* Tab Content with forms at top of each tab */}
            <div className="overflow-y-auto max-h-[500px]">
              {activeTab === "comments" ? (
                <>
                  {/* Add Comment Form - now at top of comments tab */}
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">💬 Thêm bình luận</h3>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="text-black w-full border border-gray-300 rounded-lg p-3 mb-2"
                      placeholder="Nhập bình luận của bạn..."
                    />
                    <button
                      onClick={handleSubmitComment}
                      className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition"
                    >
                      Gửi
                    </button>
                  </div>
                  
                  {/* Comments List */}
                  <div className="space-y-3">
                    {comments.map((cmt) => (
                      <div key={cmt.id} className="border p-3 rounded-lg bg-gray-50">
                        <p className="font-semibold text-sm text-gray-700">👤 Người dùng: {cmt.userId}</p>
                        <p className="mt-1 text-gray-800">{cmt.content}</p>
                      </div>
                    ))}
                    {comments.length === 0 && <p className="text-gray-500 text-sm">Chưa có bình luận nào.</p>}
                  </div>
                </>
              ) : (
                <>
                  {/* Add Rating Form - now at top of reviews tab */}
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">⭐ Đánh giá món ăn</h3>
                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} onClick={() => setRating(star)} className="cursor-pointer">
                          {rating >= star ? (
                            <AiFillStar className="text-yellow-400 text-2xl" />
                          ) : (
                            <AiOutlineStar className="text-gray-400 text-2xl" />
                          )}
                        </span>
                      ))}
                    </div>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      className="text-black w-full border border-gray-300 rounded-lg p-3 mb-2"
                      placeholder="Nhận xét kèm đánh giá..."
                    />
                    <button
                      onClick={handleSubmitReview}
                      className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition"
                    >
                      Gửi
                    </button>
                  </div>
                  
                  {/* Reviews List */}
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}