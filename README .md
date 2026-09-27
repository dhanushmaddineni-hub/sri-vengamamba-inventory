# Sri Vengamamba Inventory Management System

A full-stack inventory management system developed for Sri Vengamamba Oils & Automobiles.

The application helps manage automobile products, inventory, locations, suppliers, customers, purchases, sales, stock transfers, stock adjustments, and business reports through a web-based dashboard.

---

## 🚀 Project Overview

Sri Vengamamba Inventory Management System is designed to simplify inventory operations for an automobile shop.

The system provides:

- Product management
- Category management
- Brand management
- Location management
- Inventory management
- Supplier management
- Customer management
- Purchase management
- Sales management
- Stock transfer
- Stock adjustment
- Low-stock monitoring
- Dashboard analytics
- Sales reports
- Purchase reports
- Inventory reports
- Location reports
- Category reports

---

## 🛠️ Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML
- CSS
- Recharts

### Backend

- Node.js
- Express.js
- REST API

### Database

- PostgreSQL

### ORM

- Prisma

### Authentication

- JWT
- bcryptjs

### Development Tools

- Visual Studio Code
- Postman
- Git
- GitHub
- PowerShell

---

# 📂 Project Structure

```text
sri-vengamamba-inventory
│
├── backend
│   │
│   ├── controllers
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── customerController.js
│   │   ├── inventoryController.js
│   │   ├── locationController.js
│   │   ├── productController.js
│   │   ├── purchaseController.js
│   │   ├── reportController.js
│   │   ├── saleController.js
│   │   └── supplierController.js
│   │
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── locationRoutes.js
│   │   ├── productRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── saleRoutes.js
│   │   └── supplierRoutes.js
│   │
│   ├── prisma
│   │   └── schema.prisma
│   │
│   ├── lib
│   │   └── prisma.js
│   │
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend
│   │
│   ├── src
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md 