import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import discussionRoutes from "./routes/discussionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import hodRoutes from "./routes/hodRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";


dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL
    })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/admin", adminRoutes);




app.get("/", (req, res) => {
    res.json({
        message: "CampusConnect API is running"
    });
});

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });


