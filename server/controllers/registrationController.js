import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

export const registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.body;

        if (!eventId) {
            return res.status(400).json({
                message: "Event ID is required"
            });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (event.status !== "upcoming") {
            return res.status(400).json({
                message: "Registration is not available for this event"
            });
        }

        if (
            event.registrationDeadline &&
            new Date() > new Date(event.registrationDeadline)
        ) {
            return res.status(400).json({
                message: "Registration deadline has passed"
            });
        }

        const existingRegistration = await Registration.findOne({
            event: eventId,
            student: req.user.id,
            status: "registered"
        });

        if (existingRegistration) {
            return res.status(400).json({
                message: "You are already registered for this event"
            });
        }

        const registration = await Registration.create({
            event: eventId,
            student: req.user.id
        });

        res.status(201).json({
            message: "Event registration successful",
            registration
        });

    } catch (error) {
        res.status(500).json({
            message: "Event registration failed",
            error: error.message
        });
    }
};

export const getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({
            student: req.user.id
        })
            .populate("event")
            .sort({ createdAt: -1 });

        res.json({
            registrations
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch registrations",
            error: error.message
        });
    }
};

export const cancelRegistration = async (req, res) => {
    try {
        const registration = await Registration.findOne({
            _id: req.params.id,
            student: req.user.id
        });

        if (!registration) {
            return res.status(404).json({
                message: "Registration not found"
            });
        }

        if (registration.status === "cancelled") {
            return res.status(400).json({
                message: "Registration is already cancelled"
            });
        }

        registration.status = "cancelled";

        await registration.save();

        res.json({
            message: "Registration cancelled successfully",
            registration
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to cancel registration",
            error: error.message
        });
    }
};