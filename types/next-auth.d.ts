import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role: "user" | "business"; // Phân biệt giữa User và Business

    // Nếu là User
    reviews?: any[];
    likes?: any[];
    comments?: any[];

    // Nếu là Business
    description?: string | null;
    address?: string | null;
    foods?: any[];
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email: string;
      image?: string | null;
      role: "user" | "business";

      // Nếu là User
      reviews?: any[];
      likes?: any[];
      comments?: any[];

      // Nếu là Business
      description?: string | null;
      address?: string | null;
      foods?: any[];
    };
  }
}
