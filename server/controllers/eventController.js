import Event from "../models/Event.js";

export const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            time,
            venue,
            category,
            organizer,
            image,
            registrationDeadline,
            maxParticipants
        } = req.body;

        if (
            !title ||
            !description ||
            !date ||
            !time ||
            !venue ||
            !category ||
            !organizer
        ) {
            return res.status(400).json({
                message: "All required event fields must be provided"
            });
        }

        const event = await Event.create({
            title,
            description,
            date,
            time,
            venue,
            category,
            organizer,
            image: image || "",
            registrationDeadline,
            maxParticipants: maxParticipants || 0
        });

        res.status(201).json({
            message: "Event created successfully",
            event
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create event",
            error: error.message
        });
    }
};


export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });

        res.json({
            events
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch events",
            error: error.message
        });
    }
};


export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json({
            event
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch event",
            error: error.message
        });
    }
};


export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json({
            message: "Event updated successfully",
            event
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update event",
            error: error.message
        });
    }
};


export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json({
            message: "Event deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete event",
            error: error.message
        });
    }
};