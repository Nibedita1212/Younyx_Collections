# Younyx Collections

Younyx Collections is a modern full-stack jewelry e-commerce platform designed to deliver a premium shopping experience with elegant UI, responsive layouts, and scalable backend architecture.

The platform allows users to explore jewelry collections, browse products by categories, manage carts and wishlists, and place orders seamlessly.

---

# Tech Stack

## Frontend (User Website)
- Next.js
- React.js
- TypeScript
- Tailwind CSS

## Admin Panel
- Next.js
- React.js
- TypeScript
- Tailwind CSS

## Backend
- Spring Boot
- Java
- REST APIs

## Database
- MySQL

---

# Features

## User Features
- Responsive modern UI
- Product collections
- Category-wise browsing
- Wishlist management
- Shopping cart
- Checkout system
- User account section
- Contact & policy pages

## Admin Features
- Product management
- Category management
- Collection management
- Order management
- Contact message handling
- Admin authentication

## Backend Features
- RESTful APIs
- Structured package architecture
- Image upload support
- Config-based environment setup
- Modular services and controllers

---

# 📂 Project Structure

```bash
YOUNYX/
│
├── backend/
│   ├── src/
│   │   ├── main/java/com/younyx/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── backend/
│   │   │   ├── collection/
│   │   │   ├── config/
│   │   │   ├── contact/
│   │   │   ├── controller/
│   │   │   ├── order/
│   │   │   ├── product/
│   │   │   └── YounyxBackendApplication.java
│   │   │
│   │   └── resources/
│   │
│   ├── uploads/
│   └── pom.xml
│
├── frontend/
│   ├── app/
│   │   ├── about/
│   │   ├── account/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── collections/
│   │   ├── contact/
│   │   ├── login/
│   │   ├── my_messages/
│   │   ├── policies/
│   │   ├── products/
│   │   ├── saved/
│   │   ├── user/
│   │   └── wishlist/
│   │
│   ├── lib/
│   ├── public/
│   └── globals.css
│
├── younyx-admin/
│   ├── app/
│   │   ├── categories/
│   │   ├── collections/
│   │   ├── contacts/
│   │   ├── login/
│   │   ├── orders/
│   │   └── products/
│   │
│   ├── public/
│   └── globals.css
│
└── README.md
```

---

# ⚙️ Frontend Setup

## Navigate to Frontend

```bash
cd frontend
```

## Install Dependencies

```bash
npm install
```

## Run Frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:3000
```

---

# ⚙️ Admin Panel Setup

## Navigate to Admin Panel

```bash
cd younyx-admin
```

## Install Dependencies

```bash
npm install
```

## Run Admin Panel

```bash
npm run dev
```

Admin panel runs on:

```bash
http://localhost:3001
```

---

# ⚙️ Backend Setup

## Navigate to Backend

```bash
cd backend
```

## Run Spring Boot Backend

Using Maven:

```bash
mvn spring-boot:run
```

OR run:

```bash
YounyxBackendApplication.java
```

Backend server runs on:

```bash
http://localhost:8080
```

---

# 🔗 API Endpoints

## Products

```bash
GET /api/products
```

## Categories

```bash
GET /api/categories
```

## Collections

```bash
GET /api/collections
```

## Orders

```bash
POST /api/orders
```

## Contact

```bash
POST /api/contact
```

---

# 🎨 UI Highlights

- Premium jewelry theme
- Fully responsive layout
- Elegant typography
- Dynamic product cards
- Smooth hover animations
- Modern admin dashboard
- Optimized grid layouts

---

# 📸 Screenshots

Add screenshots for:
- Homepage
- Product Page
- Cart Page
- Wishlist
- Checkout
- Admin Dashboard

---

# 🔮 Future Enhancements

- Secure authentication with JWT
- Payment gateway integration
- Order tracking
- Product reviews & ratings
- Search & filters
- Email notifications
- Inventory management
- Analytics dashboard

---

# Author

**Nibedita Satapathy**

Project: **Younyx Collections**

---

# License

This project is developed for educational, portfolio, and learning purposes.
