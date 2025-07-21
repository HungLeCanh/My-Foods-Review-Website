// app/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";


export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập email và mật khẩu");
        }
        
        // Tìm tài khoản trong bảng User
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        // Tìm tài khoản trong bảng Business
        const business = await prisma.business.findUnique({
          where: { email: credentials.email },
        });
        
        // Nếu có cả user và business, đưa ra thông báo lỗi
        if (user && business) {
          throw new Error("Email đã được sử dụng cho cả tài khoản người dùng và doanh nghiệp. Vui lòng chọn tài khoản phù hợp.");
        }
        
        // Kiểm tra tài khoản tồn tại
        const account = user || business;
        if (!account || !account.password) {
          throw new Error("Tài khoản không tồn tại");
        }
        
        // Kiểm tra mật khẩu
        const isValid = await bcrypt.compare(credentials.password, account.password);
        if (!isValid) {
          throw new Error("Sai mật khẩu");
        }
        
        // Xác định rõ role dựa trên loại tài khoản
        const role = business ? "business" : "user";
        console.log(`Đăng nhập thành công với email ${account.email}, role: ${role}`);
        
        // Trả về thông tin tài khoản với role xác định
        return {
          id: account.id,
          name: account.name,
          email: account.email,
          image: account.image,
          role: role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Khi user mới đăng nhập, lưu thông tin vào token
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.role = token.role as "user" | "business";
      }
      return session;
    },
  },
  pages: {
    signIn: "/pages/login",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 ngày
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
    updateAge: 24 * 60 * 60, // 24 giờ
  },
  secret: process.env.NEXTAUTH_SECRET,
};