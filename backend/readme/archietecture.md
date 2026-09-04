# 💎 Aura: Luxury 3D E-Commerce Platform

A premium, white-label MERN stack e-commerce solution designed for high-end streetwear and fashion brands. Features immersive 3D product rendering, scroll-triggered animations, and a highly configurable admin portal for easy client onboarding.

## 🏗️ System Architecture

The platform is divided into three core layers to allow rapid deployment for new clients:
*   **Storefront (Client-Facing):** React-based UI with Three.js for 3D model rendering and GSAP/Framer Motion for luxury animations.
*   **Admin Dashboard:** A secure portal for store owners to manage inventory, update brand colors, and track orders.
*   **Core API (Backend):** Node.js/Express server handling authentication, payments, and database operations.

## 💻 Tech Stack

*   **Frontend:** React (Vite), Tailwind CSS, React Three Fiber (3D), GSAP (Animations)
*   **Backend:** Node.js, Express.js, JWT Authentication
*   **Database:** MongoDB with Mongoose ORM
*   **Storage:** Cloudinary (Images & .glb 3D models)
*   **Payments:** Stripe / Razorpay

## 📂 Project Structure

| Directory | Purpose |
| :--- | :--- |
| `/backend/models` | MongoDB database schemas (Product, User, StoreConfig) |
| `/backend/routes` | API endpoints for auth, inventory, and checkout |
| `/frontend/src/components` | Reusable React UI elements (Buttons, Cards, Navbar) |
| `/frontend/src/canvas` | Three.js files for the 3D interactive clothing models |
| `/admin` | Separate dashboard for client store management |

## 🚀 Deployment Plan

1.  **Phase 1: Backend Foundation** - Initialize Node/Express, connect MongoDB, and build CRUD APIs for products.
2.  **Phase 2: Admin Portal** - Build the inventory management system with image/3D asset uploading.
3.  **Phase 3: The 3D Storefront** - Implement the dark-themed UI, connect React Three Fiber, and integrate scroll animations.
4.  **Phase 4: Checkout & Launch** - Integrate payment gateways and deploy via Vercel (Frontend) and Railway/Render (Backend).





                       ┌─────────────────────────┐
                       │   Client Brand Asset    │
                       │ (Theme, Logo, 3D Assets)│
                       └────────────┬────────────┘
                                    │
┌─────────────────────────┐         ▼         ┌─────────────────────────┐
│  Customer Storefront    │ ◄───────────────► │   Admin Dashboard       │
│  (React + Three.js/R3F) │                   │  (Inventory, Orders)    │
└────────────┬────────────┘                   └────────────┬────────────┘
             │                                             │
             └──────────────────────┬──────────────────────┘
                                    ▼
                       ┌─────────────────────────┐
                       │   Express / Node API    │
                       │ (JWT Auth, Stripe, CMS) │
                       └────────────┬────────────┘
                                    │
                      ┌─────────────┴─────────────┐
                      ▼                           ▼
          ┌───────────────────────┐   ┌───────────────────────┐
          │   MongoDB Database    │   │  Cloudinary / S3 CDN  │
          │ (Products, Orders, DB)│   │  (Images, 3D GLTF)    │
          └───────────────────────┘   └───────────────────────┘