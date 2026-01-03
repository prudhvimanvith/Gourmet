# Gourmet POS & Inventory System

A comprehensive, smart restaurant management system designed to handle complex multi-stage recipes, real-time inventory tracking, and point-of-sale operations.

## 🚀 Features

### 🥗 Smart Recipe Builder
- Create complex recipes with nested ingredients (e.g., *Pizza* uses *Dough*, which uses *Flour*).
- **Auto-Costing**: Automatically calculates the cost of a dish based on the cost of its raw materials.
- **Recursive Inventory Deduction**: Selling a Pizza automatically deducts Flour, Cheese, and Sauce from stock.

### 🏪 Point of Sale (POS)
- Fast, touch-friendly interface for cashiers.
- Real-time stock validation (prevents selling what you don't have).
- Support for modifiers and custom notes.

### 📦 Advanced Inventory Management
- **Real-time Tracking**: Monitor Raw Materials, Intermediate Items (Prep), and Final Dishes.
- **Kitchen Prep Station**: Log production of intermediate items (e.g., "Mades 5kg of Marinara Sauce") and auto-deduct raw ingredients.
- **Stock Alerts**: Visual warnings for low-stock items.
- **Manual Adjustments**: Handle deliveries and waste easily.

### 📊 Analytics Dashboard
- Live sales tracking.
- Operational metrics (Active Orders, Low Stock Alerts).
- Activity feed of recent transactions.

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4, TanStack Query, Framer Motion.
- **Backend**: Node.js, Express, TypeScript.
- **Database**: PostgreSQL (Primary Data), Redis (Caching & Sessions).
- **Infrastructure**: Docker & Docker Compose.

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/prudhvimanvith/Gourmet.git
    cd Gourmet
    ```

2.  **Install Backend Dependencies**
    ```bash
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd client
    npm install
    cd ..
    ```

### Running the App

1.  **Start Database (Postgres & Redis)**
    ```bash
    docker-compose up -d postgres redis
    ```

2.  **Start Backend Server**
    ```bash
    npx ts-node src/index.ts
    ```
    *Server runs on `http://localhost:3000`*

3.  **Start Frontend**
    ```bash
    cd client
    npm run dev
    ```
    *App runs on `http://localhost:5173`*

## 🧪 Testing

To run the seeding script (populates DB with sample data):
```bash
npx ts-node src/scripts/seed.ts
```

## 📜 License
MIT
