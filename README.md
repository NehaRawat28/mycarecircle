MyCareCircle – Family Health Management System

MyCareCircle is a full-stack MERN application designed to help families manage medicines, appointments, emergency contacts, and health reminders in one centralized platform.

This project demonstrates authentication, role-based data access, background jobs, and full CRUD operations using modern web technologies.

🚀 Live Features

🔐 JWT-based Authentication (Register/Login)

👨‍👩‍👧 Manage Multiple Family Members

💊 Add & Track Medicines

📅 Manage Appointments

🚨 Store Emergency Contacts

⏰ Automated Reminder Job (Node Cron)

📊 Organized Dashboard View

🔒 Protected Routes (Backend Middleware)

🛠 Tech Stack
Frontend

React (Vite)

Context API

React Router

Axios

Backend

Node.js

Express.js

MongoDB (MongoDB Atlas)

Mongoose

JWT Authentication

Node Cron (Background Jobs)

🏗 System Architecture

RESTful API design

MVC Folder Structure

Middleware-based route protection

Background reminder scheduler

Cloud database (MongoDB Atlas)

📂 Project Structure
MyCareCircle/
 ├── backend/
 │   ├── controllers/
 │   ├── models/
 │   ├── routes/
 │   ├── middleware/
 │   └── server.js
 │
 ├── frontend/
 │   ├── components/
 │   ├── pages/
 │   ├── context/
 │   └── App.jsx

⚙️ Installation & Setup
Backend
cd backend
npm install
npm run dev


Create a .env file:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
PORT=5000

Frontend
cd frontend
npm install
npm run dev

🧠 Key Learning Outcomes

Secure authentication using JWT

Designing scalable REST APIs

MongoDB schema relationships

Handling background jobs using cron

Managing global state in React

Protecting API routes with middleware

Full-stack project deployment readiness

🎯 Why This Project?

This project simulates a real-world health tracking system for families and demonstrates:

Full-stack development skills

Clean project structure

Secure authentication practices

Production-ready backend setup

Cloud database integration

👩‍💻 Author

Neha Rawat
Full Stack Developer
(https://www.linkedin.com/in/neharawat28/)
