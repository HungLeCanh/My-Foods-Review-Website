# My Foods Review Website

A web application that allows users to discover and search for dishes in their area, and enables F&B businesses to create business accounts and post their menus to promote their offerings.

Preview my website: https://my-foods-review-website.vercel.app/

## Features

- **User Functionality**: Search for dishes by name, category, or location.
- **Business Accounts**: F&B businesses can register, create business profiles, and upload their menus.
- **Authentication**: Implemented using NextAuth with Google OAuth support.
- **Image Hosting**: Images are stored and served via Cloudinary.

## Tech Stack

- **Frontend**: Next.js 13 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL (hosted on Aiven.io)
- **Authentication**: NextAuth.js with Google OAuth
- **Image Hosting**: Cloudinary

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/HungLeCanh/My-Foods-Review-Website.git
   cd My-Foods-Review-Website
   ```


2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```


3. Set up environment variables:

   Create a `.env.local` file in the root directory and add the following:

   ```env
   DATABASE_URL=your_mysql_database_url
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CLOUDINARY_URL=your_cloudinary_url
   ```


   Replace the placeholder values with your actual credentials.

4. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```


5. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```


   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Environment Variables

| Variable             | Description                             |
|----------------------|-----------------------------------------|
| `DATABASE_URL`       | MySQL database connection string        |
| `NEXTAUTH_SECRET`    | Secret key for NextAuth                 |
| `GOOGLE_CLIENT_ID`   | Google OAuth client ID                  |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret            |
| `CLOUDINARY_URL`     | Cloudinary URL for image storage        |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
