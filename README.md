PG Stay System

A full-stack web application for managing and recommending PG (Paying Guest) accommodations.

This project aims to help students and working professionals easily find, compare, and manage PG stays, while allowing owners and admins to manage listings efficiently.

🚀 Features (Planned)
👤 User (Student / Tenant)

View PG stay listings

Search and filter PG stays

View details (rent, amenities, location)

Send enquiry / request booking

🏠 PG Owner

Register and manage PG accommodations

Add rooms, rent, and amenities

View tenant requests

🛡️ Admin

Verify PG accommodations

Manage users and owners

Monitor platform activity

🛠️ Tech Stack
Frontend

React (Vite)

JavaScript

CSS

Backend (Upcoming)

Node.js

Express.js

MongoDB

📁 Project Structure

PG-Stay-System
└── frontend
  ├── src
  │ ├── components
  │ ├── pages
  │ ├── services
  │ └── styles
  └── package.json

▶️ How to Run (Frontend)

Open terminal

Go to frontend folder

Run these commands:

npm install
npm run dev

▶️ Environment Configuration

Replace localhost references with site configuration using environment variables.

**Backend Setup** (`backend/.env`):
```
MONGO_URI=mongodb://localhost:27017/pgstay
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

For production with site domain:
```
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Frontend Setup** (`frontend/.env.local`):
```
VITE_API_URL=http://localhost:5000/api
```

For production:
```
VITE_API_URL=https://yourdomain.com/api
```

Copy `backend/.env.example` to `backend/.env` and update values.
Copy `frontend/.env.example` to `frontend/.env.local` and update values.

👥 Team Collaboration

This project follows a branch-based workflow.
Each feature is developed in a separate branch and merged into the main branch via pull requests.

📌 Status

🚧 Project under active development

📄 License

This project is for academic and learning purposes.

✅ AFTER PASTING, RUN THIS (in terminal)

git add README.md
git commit -m "Add project README"
git push
