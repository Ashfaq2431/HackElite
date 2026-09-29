import Attendance from "../models/Attendance.js";
import User from "../models/User.js";


export const markAttendance = async (req, res) => {
    try {
        const {
            student,
            date,
            status,
            subject
        } = req.body;

        if (!student || !date || !status || !subject) {
            return res.status(400).json({
                message: "Student, date, status and subject are required"
            });
        }

        const studentUser = await User.findById(student);

        if (!studentUser) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        if (studentUser.role !== "student") {
            return res.status(400).json({
                message: "Attendance can only be marked for students"
            });
        }

        const existingAttendance = await Attendance.findOne({
            student,
            date: new Date(date),
            subject
        });

        if (existingAttendance) {
            return res.status(400).json({
                message: "Attendance already marked for this student"
            });
        }

        const attendance = await Attendance.create({
            student,
            date: new Date(date),
            status,
            subject,
            markedBy: req.user.id
        });

        res.status(201).json({
            message: "Attendance marked successfully",
            attendance
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to mark attendance",
            error: error.message
        });
    }
};


export const getStudentAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({
            student: req.params.studentId
        })
            .populate(
                "student",
                "name email studentId department year"
            )
            .populate(
                "markedBy",
                "name email role"
            )
            .sort({
                date: -1
            });

        res.json({
            attendance
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch student attendance",
            error: error.message
        });
    }
};


export const getMyAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({
            student: req.user.id
        })
            .populate(
                "markedBy",
                "name email role"
            )
            .sort({
                date: -1
            });

        const totalClasses = attendance.length;

        const presentClasses = attendance.filter(
            record => record.status === "present"
        ).length;

        const absentClasses = attendance.filter(
            record => record.status === "absent"
        ).length;

        const percentage =
            totalClasses === 0
                ? 0
                : ((presentClasses / totalClasses) * 100).toFixed(2);

        res.json({
            summary: {
                totalClasses,
                presentClasses,
                absentClasses,
                percentage: Number(percentage)
            },
            attendance
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch your attendance",
            error: error.message
        });
    }
};


export const updateAttendance = async (req, res) => {
    try {
        const {
            status
        } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Attendance status is required"
            });
        }

        const attendance = await Attendance.findById(
            req.params.id
        );

        if (!attendance) {
            return res.status(404).json({
                message: "Attendance record not found"
            });
        }

        attendance.status = status;
        attendance.markedBy = req.user.id;

        await attendance.save();

        res.json({
            message: "Attendance updated successfully",
            attendance
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update attendance",
            error: error.message
        });
    }
};
