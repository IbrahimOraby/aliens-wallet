# Digi Gift Spark - Digital Services & Gift Cards E-Commerce Platform

A modern, full-stack e-commerce platform for selling digital services and gift cards with instant delivery. Features a customer-facing storefront and a comprehensive admin dashboard for managing products, categories, and orders.

## 🚀 Features

### Customer Store
- **Product Catalog** - Browse digital services and gift cards with advanced filtering
- **Cascading Variation Selection** - Smart dropdown system (Region → Duration → Type) for selecting product variations
- **Shopping Cart** - Add to cart with quantity management
- **Checkout Flow** - Complete purchase process with order confirmation
- **Product Details** - Detailed product pages with variations, pricing, and descriptions
- **Responsive Design** - Mobile-first design that works on all devices

### Admin Dashboard
- **Product Management** - Create, edit, and delete products with multiple variations
- **Category Management** - Hierarchical category system (parent/child categories)
- **Variation Management** - Configure pricing, duration, regions, and availability
- **Order Management** - Track and manage customer orders
- **User Authentication** - Role-based access control (Admin/Customer)
- **Real-time Updates** - Dynamic product counts and availability tracking

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- API endpoint configuration (update API base URL in services)

## 🏃 Getting Started

### Installation

1. **Clone the repository**
   ```sh
   git clone <YOUR_GIT_URL>
   cd digi-gift-spark-main
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure API endpoint** (if needed)
   Update the API base URL in `src/services/*.ts` files:
   ```typescript
   const API_BASE_URL = 'http://your-api-url.com/api';
   ```

4. **Start development server**
   ```sh
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── ui/             # shadcn/ui components
│   └── ...
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
│   ├── store/          # Customer-facing pages
│   └── ...             # Admin dashboard pages
├── schemas/            # Zod validation schemas
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── ...
```

## 🎯 Key Features Implementation

### Cascading Variation Selection
The product detail page implements a smart three-dropdown system:
1. **Region** - Select available region
2. **Duration** - Filtered based on selected region
3. **Type** - Filtered based on region + duration

This ensures users only see valid product combinations.

### Product Variations
- Multiple variations per product
- Region-based availability
- Duration and max users configuration
- Stock management (unlimited or limited count)

### Shopping Cart
- Persistent cart (localStorage)
- Quantity management
- Variation-based cart items
- Total price calculation

## 🔐 Authentication

The platform supports role-based authentication:
- **Admin** - Full access to dashboard and management features
- **Customer** - Access to store and purchase features

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🌐 API Integration

The application integrates with a RESTful API for:
- Product management
- Category management
- User authentication
- Order processing
- Region management

## 🎨 UI/UX Highlights

- **Hero Carousel** - Dynamic, full-screen product showcases
- **Product Cards** - Consistent, responsive card design across all views
- **Loading States** - Skeleton screens and spinners for better UX
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Non-intrusive feedback for user actions

## 📝 Development Notes

- All forms use React Hook Form with Zod validation
- API calls are handled through service layer with error handling
- Product variations support unlimited or limited stock counts
- Categories support hierarchical structure (parent/child)
- Responsive design follows mobile-first approach

## 🔧 Configuration

Update environment variables and API endpoints as needed:
- API Base URL in service files
- Authentication token management in `src/services/auth.ts`

## 📄 License

[Add your license information here]

## 👥 Contributors

[Add contributor information here]

---

Built with ❤️ using React, TypeScript, and modern web technologies.
