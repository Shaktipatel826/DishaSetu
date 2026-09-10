# 🎓 DishaSetu — Right Opportunity → Right Person → Right Time

A complete full-stack web application connecting Indian students with personalized scholarships, government schemes, coding hackathons, competitive exams, quiz competitions, and skill development programs.

---

## 🌟 Value Proposition & Vision

- **The Vision**: Students across India miss out on life-changing scholarships, government welfare schemes, hackathons, and competitions simply due to lack of timely information and complex eligibility criteria.
- **The Solution**: **DishaSetu** acts as a unified digital bridge, offering instant eligibility filtering, dynamic scroller tickers, official proof document verification, and direct application links.

---

## 🛠️ Technology Stack

- **Backend**: Node.js (v18+) & Express.js
- **Database**: MongoDB Atlas with Mongoose ODM (via `MONGO_URI`)
- **Frontend**: HTML5, CSS3 (*Warm Cream, Ivory, Deep Navy, Professional Blue & Subtle Teal Design System*), Vanilla JavaScript (`fetch()` API)
- **Authentication**: JWT stored in secure `httpOnly` cookies + `bcryptjs` password hashing
- **Access Control**: Role-Based Access Control (RBAC) protecting Student and Admin endpoints
- **File Uploads**: `multer` file handler for official circular/proof document uploads
- **Background Cron**: Automated deadline tracking service (`services/deadlineCron.js`)

---

## 📁 Project Structure

```text
DishaSetu/
├── server.js                      # Express server & static asset server
├── package.json                   # Dependencies and npm scripts
├── render.yaml                    # Render Web Service Blueprint specification
├── .gitignore                     # Git exclusion rules (.env, uploads, node_modules)
├── config/
│   └── db.js                      # MongoDB connection setup
├── models/
│   ├── User.js                    # Student profile schema
│   ├── Admin.js                   # Admin authentication schema
│   ├── Opportunity.js             # Scholarships, hackathons, exams schema
│   ├── Scheme.js                  # Central & State Government Schemes schema
│   ├── Submission.js              # Student opportunity submission & proof schema
│   ├── SavedItem.js               # Saved opportunity bookmarks schema
│   └── Notification.js            # In-app notifications schema
├── middleware/
│   ├── auth.js                    # JWT verification and RBAC middleware
│   └── upload.js                  # Multer proof document upload middleware
├── controllers/
│   ├── authController.js          # Student & Admin registration & login
│   ├── opportunityController.js   # Public catalog browsing, search & ticker
│   ├── schemeController.js        # Government schemes catalog
│   ├── submissionController.js   # Student submissions & admin proof review
│   ├── savedItemController.js     # Saved bookmarks management
│   ├── notificationController.js  # Student notifications
│   └── adminController.js         # Admin dashboard stats & student directory
├── routes/
│   ├── authRoutes.js              # /api/auth
│   ├── opportunityRoutes.js       # /api/opportunities
│   ├── schemeRoutes.js            # /api/schemes
│   ├── submissionRoutes.js       # /api/submissions
│   ├── savedRoutes.js             # /api/saved
│   ├── notificationRoutes.js      # /api/notifications
│   └── adminRoutes.js             # /api/admin
├── services/
│   └── deadlineCron.js            # Deadline alert background cron service
├── seedData.js                    # Seed script for admin & sample student data
└── public/
    ├── index.html                 # Homepage with 3D Orbit Carousel & scroller ticker
    ├── opportunities.html         # Opportunities discovery page
    ├── schemes.html               # Government schemes discovery page
    ├── opportunity-details.html   # Single opportunity detailed view
    ├── scheme-details.html        # Single scheme detailed view
    ├── submit-opportunity.html    # Student opportunity submission with proof upload
    ├── my-submissions.html        # Student submission tracking portal
    ├── login.html                 # Dual-role Login (Student / Admin)
    ├── register.html              # Student registration form
    ├── dashboard.html             # Student profile & saved items dashboard
    ├── admin-dashboard.html       # Admin control console
    ├── admin-submissions.html     # Admin proof verification & approval console
    ├── admin-students.html        # Admin registered students directory
    ├── style.css                  # Custom warm cream / professional blue design system
    └── js/                        # Client-side modules (theme-nav, eligibility, main, i18n)
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (MongoDB Atlas Cloud Cluster or local MongoDB instance)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.ebei0vb.mongodb.net/dishasetu?appName=Cluster0
JWT_SECRET=dishasetu_super_secret_jwt_key_2026
NODE_ENV=development
```

### 4. Seed Database (Admin & Sample Opportunities)
```bash
npm run seed
```

### 5. Start the Server
```bash
npm start
```

Visit the application in your browser: **`http://localhost:5000`**

---

## 🔑 Demo Credentials

| Role | Email | Password | Access / Portal |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@dishasetu.in` | `Admin@123` | [admin-dashboard.html](http://localhost:5000/admin-dashboard.html) |
| **Student** | `student.demo@dishasetu.in` | `Student@123` | [dashboard.html](http://localhost:5000/dashboard.html) |

---

## 🛡️ License & Platform Information
Designed for Student Empowerment & Guidance across India.
© 2026 DishaSetu. All rights reserved.
