# 🎓 CampusConnect – College Community Portal

A full-stack **MERN** (MongoDB, Express, React, Node.js) platform designed to unite students, campus clubs, faculty members, and administrators in a single digital environment.

---

## 🌟 Key Features

1. **Centralized Campus Platform**:
   - Seamless hub connecting students, student organizations, faculty, and system administrators.
   - Real-time updates via Socket.io for campus-wide notices, event updates, and notifications.

2. **Personalized Student Community Profiles**:
   - Customizable profiles with departments, graduation years, student roll numbers, and bios.
   - Technical and soft skill tags, extracurricular interests, and honors/achievements timeline.
   - Connected social handles (GitHub, LinkedIn, Portfolio).

3. **Centralized Announcements & Circulars**:
   - Official notices categorized by *Academic*, *Event*, *Urgent Notice*, *Placement & Career*, *Sports*, and *General*.
   - Priority levels (*Normal*, *High*, *Urgent Notice*) with color-coded badges and real-time toast alerts.
   - Pinned notices support, view counters, and official document attachment downloads.

4. **Club & Student Organization Management**:
   - Club directory with search and categorization (*Technology*, *Cultural*, *Sports*, *Academic*, *Entrepreneurship*, etc.).
   - Club dedicated spaces: leadership roster, meeting schedules, room venues, and official club events.
   - Membership lifecycle: request to join with custom statement, review and approve/reject workflows, and member management.
   - Club creation application modal for new student organizations.

5. **Campus Event Discovery & Ticketing RSVP**:
   - Centralized events calendar covering hackathons, workshops, seminars, cultural galas, and webinars.
   - Detailed event pages with speakers, schedules, and capacity tracking.
   - **One-Click Event Pass Generation**: unique ticket IDs (`CC-TKT-XXXX`), ticket passes with mock QR codes, and RSVP cancellation.
   - Organizer check-in console to mark attendee attendance on the day of the event.

6. **Community Discussion Forum**:
   - Interactive Q&A spaces for course guidance, internship prep, hackathon team formation, and lost & found.
   - Thread upvoting, threaded comment replies, and **Accepted Solution** badge marking by thread authors.

7. **Content & Document Repository**:
   - Shared academic syllabi, lecture notes, student organization manuals, and circulars.
   - Real-time download counters and document upload modal.

8. **Student Engagement Analytics**:
   - Interactive KPI cards for total scholars, active clubs, published events, and RSVPs.
   - Visual participation distribution charts (membership rankings, turnout rates, departmental breakdown).

9. **Secure Role-Based Governance (Admin Panel)**:
   - System Admin console to regulate user roles (*Student*, *Club Admin*, *Faculty*, *System Admin*).
   - Instant account activation/suspension toggles and club moderation.

---

## 🔑 Demo Accounts (Pre-Seeded)

The portal comes pre-populated with realistic campus data and demo accounts. You can sign in using the **1-Click Quick Demo Login** buttons on the login page, or manually with the credentials below:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@campusconnect.edu` | `Admin@123` | Full administrative control, user role management, account suspension, club approval |
| **Faculty Member** | `faculty@campusconnect.edu` | `Faculty@123` | Post official academic announcements, host seminars/workshops, mentor discussions |
| **Club President / Lead** | `techlead@campusconnect.edu` | `Club@123` | Manage GDSC club, approve/reject member join requests, organize hackathons & events |
| **Student** | `student@campusconnect.edu` | `Student@123` | RSVP for events, get ticket passes, submit club join requests, post in forum |

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 (Vite)
  - Tailwind CSS v4
  - React Router DOM v7
  - Lucide React (Icons)
  - Axios (API Client with JWT Interceptors)
  - Socket.io-client (Real-time events)

- **Backend**:
  - Node.js & Express.js
  - MongoDB & Mongoose ODM
  - JSON Web Tokens (JWT) & bcryptjs authentication
  - Multer (File & media uploads)
  - Socket.io (WebSocket event broadcaster)
  - Morgan (HTTP request logger)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`

### 2. Seeding the Database
The project includes a seeder that populates users, clubs, events, circulars, discussions, and resources:
```bash
cd server
npm run seed
```

### 3. Running the Backend Server
```bash
cd server
npm run dev
```
Backend will start on `http://localhost:5000`.

### 4. Running the Frontend Client
```bash
cd client
npm run dev
```
Frontend will be accessible at `http://localhost:3000`.

*(Alternatively, run `start-all.bat` on Windows to launch both concurrently).*

---

## 📡 API Reference Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create student or faculty account
- `POST /api/auth/login` - Authenticate and receive JWT
- `GET /api/auth/me` - Get current user profile *(Protected)*
- `PUT /api/auth/profile` - Update profile details *(Protected)*
- `GET /api/auth/users` - List all users *(Admin only)*
- `PUT /api/auth/users/:id/role` - Update user role or status *(Admin only)*

### Clubs (`/api/clubs`)
- `GET /api/clubs` - List active clubs (category/search filters)
- `GET /api/clubs/:id` - Detailed club overview, roster, and events
- `POST /api/clubs` - Propose a new student club *(Protected)*
- `POST /api/clubs/:id/join` - Submit join application *(Protected)*
- `PUT /api/clubs/:id/requests/:requestId` - Approve/reject request *(Club Lead/Admin)*
- `POST /api/clubs/:id/leave` - Leave a club *(Protected)*

### Events (`/api/events`)
- `GET /api/events` - Get events (filters: upcoming, past, category, search)
- `GET /api/events/:id` - Get event details and attendees
- `POST /api/events` - Create event *(Club Lead, Faculty, Admin)*
- `POST /api/events/:id/register` - RSVP and generate event pass ticket *(Protected)*
- `POST /api/events/:id/cancel` - Cancel event registration *(Protected)*
- `PUT /api/events/:id/attendees/:ticketId/checkin` - Mark attendee checked in *(Organizer)*

### Announcements (`/api/announcements`)
- `GET /api/announcements` - List announcements with priority & category filters
- `POST /api/announcements` - Publish announcement *(Faculty, Club Lead, Admin)*
- `PUT /api/announcements/:id/pin` - Toggle pinned notice *(Admin, Faculty)*
- `DELETE /api/announcements/:id` - Remove announcement *(Author, Admin)*

### Discussions (`/api/discussions`)
- `GET /api/discussions` - List forum threads (sort: newest, popular, replies)
- `POST /api/discussions` - Start discussion thread *(Protected)*
- `POST /api/discussions/:id/replies` - Reply to thread *(Protected)*
- `POST /api/discussions/:id/upvote` - Upvote/un-upvote thread *(Protected)*
- `PUT /api/discussions/:id/replies/:replyId/accept` - Mark accepted answer *(Author)*

### Resources & Analytics
- `GET /api/resources` - Browse campus documents and past papers
- `POST /api/resources` - Upload/share document *(Protected)*
- `POST /api/resources/:id/download` - Track document downloads
- `GET /api/analytics` - System metrics, club popularity, and departmental charts
