import User from "../models/User.js";

export const getStudentProfile = async (req, res) => {
    try {
        const student = await User.findById(req.user.id).select("-password");

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        if (student.role !== "student") {
            return res.status(403).json({
                message: "Student access only"
            });
        }

        res.json({
            student
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch student profile",
            error: error.message
        });
    }
};


export const updateStudentProfile = async (req, res) => {
    try {
        const {
            name,
            email,
            studentId,
            department,
            year,
            phone,
            bio,
            profileImage
        } = req.body;

        const student = await User.findById(req.user.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        if (student.role !== "student") {
            return res.status(403).json({
                message: "Student access only"
            });
        }

        if (name !== undefined) {
            student.name = name;
        }

        if (email !== undefined) {
            const existingUser = await User.findOne({
                email,
                _id: { $ne: req.user.id }
            });

            if (existingUser) {
                return res.status(400).json({
                    message: "Email already in use"
                });
            }

            student.email = email;
        }

        if (studentId !== undefined) {
            student.studentId = studentId;
        }

        if (department !== undefined) {
            student.department = department;
        }

        if (year !== undefined) {
            student.year = year;
        }

        if (phone !== undefined) {
            student.phone = phone;
        }

        if (bio !== undefined) {
            student.bio = bio;
        }

        if (profileImage !== undefined) {
            student.profileImage = profileImage;
        }

        await student.save();

        res.json({
            message: "Student profile updated successfully",
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                role: student.role,
                studentId: student.studentId,
                department: student.department,
                year: student.year,
                phone: student.phone,
                bio: student.bio,
                profileImage: student.profileImage
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update student profile",
            error: error.message
        });
    }
};