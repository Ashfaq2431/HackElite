import User from "../models/User.js";
import Attendance from "../models/Attendance.js";

export const getDepartmentStudents = async (req, res) => {
    try {
        const hod = await User.findById(req.user.id);

        if (!hod) {
            return res.status(404).json({
                message: "HOD not found"
            });
        }

        const students = await User.find({
            role: "student",
            department: hod.department
        }).select("-password");

        res.json({
            department: hod.department,
            students
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch department students",
            error: error.message
        });
    }
};


export const getDepartmentFaculty = async (req, res) => {
    try {
        const hod = await User.findById(req.user.id);

        if (!hod) {
            return res.status(404).json({
                message: "HOD not found"
            });
        }

        const faculty = await User.find({
            role: "faculty",
            department: hod.department
        }).select("-password");

        res.json({
            department: hod.department,
            faculty
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch department faculty",
            error: error.message
        });
    }
};


export const getDepartmentAttendance = async (req, res) => {
    try {
        const hod = await User.findById(req.user.id);

        if (!hod) {
            return res.status(404).json({
                message: "HOD not found"
            });
        }

        const students = await User.find({
            role: "student",
            department: hod.department
        }).select("_id name email studentId year");

        const studentIds = students.map(student => student._id);

        const attendance = await Attendance.find({
            student: { $in: studentIds }
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
            department: hod.department,
            attendance
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch department attendance",
            error: error.message
        });
    }
};


export const getDepartmentStats = async (req, res) => {
    try {
        const hod = await User.findById(req.user.id);

        if (!hod) {
            return res.status(404).json({
                message: "HOD not found"
            });
        }

        const students = await User.countDocuments({
            role: "student",
            department: hod.department
        });

        const faculty = await User.countDocuments({
            role: "faculty",
            department: hod.department
        });

        const studentUsers = await User.find({
            role: "student",
            department: hod.department
        }).select("_id");

        const studentIds = studentUsers.map(student => student._id);

        const attendance = await Attendance.find({
            student: { $in: studentIds }
        }).select("status");

        const totalAttendance = attendance.length;

        const presentAttendance = attendance.filter(
            record => record.status === "present"
        ).length;

        const absentAttendance = attendance.filter(
            record => record.status === "absent"
        ).length;

        const attendancePercentage =
            totalAttendance === 0
                ? 0
                : Number(
                    ((presentAttendance / totalAttendance) * 100).toFixed(2)
                );

        res.json({
            department: hod.department,
            stats: {
                totalStudents: students,
                totalFaculty: faculty,
                totalAttendanceRecords: totalAttendance,
                presentAttendance,
                absentAttendance,
                attendancePercentage
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch department statistics",
            error: error.message
        });
    }
};
