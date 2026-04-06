# 🚀 Asset & Inventory Management System (Network18)

A full-stack web application for managing assets, inventory, events, and administrative operations efficiently. Built using **Next.js (Frontend)**, **Express.js (Backend)**, and **MySQL (Database)**.

---

## 📌 Features

### 👤 Authentication & Authorization
- Secure login/logout system  
- Role-based access (Admin / User)
- Permission-based access  
- Session / token-based authentication  

### 📦 Inventory Management
- Add, update, delete inventory items  
- Track asset availability  
- Category-based organization  

### 🧾 Asset Management
- Assign assets to users  
- Track asset usage  
- Maintain asset history  

### 📅 Event Management
- Create and manage events  
- Register/deregister users  
- View attendees list  

### 📊 Admin Dashboard
- Overview of system data  
- Manage users and inventory  
- Basic analytics  

---

## 🛠️ Tech Stack

### Frontend
- Next.js  
- React.js  
- Tailwind CSS  

### Backend
- Node.js  
- Express.js  

### Database
- MySQL  

### Other Tools
- Git & GitHub  
- REST APIs

- -

## ⚙️ Installation & Setup

### 🔹 1. Clone the repository
```bash
git clone https://github.com/SAUMYAMUNDRA/ASSET_AND_INVENTORY_MANAGEMENT_NETWORK18.git
cd ASSET_AND_INVENTORY_MANAGEMENT_NETWORK18
```

---

### 🔹 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in backend:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=inventory_db
JWT_SECRET=your_secret_key
```

Run backend:
```bash
npm start
```

---

### 🔹 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
```
http://localhost:3000
```

---

### 🔹 4. Setup MySQL Database

Create database:
```sql
CREATE DATABASE inventory_db;
```

Import schema:
```bash
mysql -u root -p inventory_db < schema.sql
```



## 🤝 Contributing
Contributions are welcome! Fork the repo and submit a pull request.

---

## 📜 License
This project is for educational purposes.

---

## 👨‍💻 Author
**Saumya Mundra**  
GitHub: https://github.com/SAUMYAMUNDRA  

---

## ⭐ Show your support
If you like this project, give it a ⭐ on GitHub!
