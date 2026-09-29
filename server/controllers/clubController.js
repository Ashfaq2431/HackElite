import Club from "../models/Club.js";
import ClubMember from "../models/ClubMember.js";

export const createClub = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            facultyCoordinator,
            meetingSchedule,
            venue,
            image
        } = req.body;

        if (!name || !description || !category || !facultyCoordinator) {
            return res.status(400).json({
                message: "Name, description, category and faculty coordinator are required"
            });
        }

        const existingClub = await Club.findOne({ name });

        if (existingClub) {
            return res.status(400).json({
                message: "Club already exists"
            });
        }

        const club = await Club.create({
            name,
            description,
            category,
            facultyCoordinator,
            meetingSchedule: meetingSchedule || "",
            venue: venue || "",
            image: image || ""
        });

        const populatedClub = await Club.findById(club._id).populate(
            "facultyCoordinator",
            "name email role"
        );

        res.status(201).json({
            message: "Club created successfully",
            club: populatedClub
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create club",
            error: error.message
        });
    }
};


export const getAllClubs = async (req, res) => {
    try {
        const clubs = await Club.find({
            status: "active"
        })
            .populate(
                "facultyCoordinator",
                "name email role"
            )
            .sort({ createdAt: -1 });

        res.json({
            clubs
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch clubs",
            error: error.message
        });
    }
};


export const getClubById = async (req, res) => {
    try {
        const club = await Club.findOne({
            _id: req.params.id,
            status: "active"
        }).populate(
            "facultyCoordinator",
            "name email role"
        );

        if (!club) {
            return res.status(404).json({
                message: "Club not found"
            });
        }

        res.json({
            club
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch club",
            error: error.message
        });
    }
};


export const updateClub = async (req, res) => {
    try {
        const club = await Club.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate(
            "facultyCoordinator",
            "name email role"
        );

        if (!club) {
            return res.status(404).json({
                message: "Club not found"
            });
        }

        res.json({
            message: "Club updated successfully",
            club
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update club",
            error: error.message
        });
    }
};


export const deleteClub = async (req, res) => {
    try {
        const club = await Club.findByIdAndUpdate(
            req.params.id,
            { status: "inactive" },
            { new: true }
        );

        if (!club) {
            return res.status(404).json({
                message: "Club not found"
            });
        }

        res.json({
            message: "Club deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete club",
            error: error.message
        });
    }
};

export const joinClub = async (req, res) => {
    try {
        const { clubId } = req.body;

        if (!clubId) {
            return res.status(400).json({
                message: "Club ID is required"
            });
        }

        const club = await Club.findOne({
            _id: clubId,
            status: "active"
        });

        if (!club) {
            return res.status(404).json({
                message: "Club not found"
            });
        }

        const existingMembership = await ClubMember.findOne({
            club: clubId,
            student: req.user.id
        });

        if (existingMembership) {
            if (existingMembership.status === "active") {
                return res.status(400).json({
                    message: "You are already a member of this club"
                });
            }

            existingMembership.status = "active";
            existingMembership.joinedAt = new Date();

            await existingMembership.save();

            return res.status(200).json({
                message: "You joined the club successfully",
                membership: existingMembership
            });
        }

        const membership = await ClubMember.create({
            club: clubId,
            student: req.user.id
        });

        res.status(201).json({
            message: "You joined the club successfully",
            membership
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to join club",
            error: error.message
        });
    }
};


export const getMyClubs = async (req, res) => {
    try {
        const memberships = await ClubMember.find({
            student: req.user.id,
            status: "active"
        })
            .populate("club")
            .sort({ joinedAt: -1 });

        res.json({
            clubs: memberships
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch your clubs",
            error: error.message
        });
    }
};


export const leaveClub = async (req, res) => {
    try {
        const membership = await ClubMember.findOne({
            club: req.params.id,
            student: req.user.id,
            status: "active"
        });

        if (!membership) {
            return res.status(404).json({
                message: "You are not an active member of this club"
            });
        }

        membership.status = "left";

        await membership.save();

        res.json({
            message: "You left the club successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to leave club",
            error: error.message
        });
    }
};

