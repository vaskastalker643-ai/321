const express = require("express");
const {
  createAppointment,
  getAppointmentsByUser,
  getAllAppointments,
  updateAppointmentStatus,
} = require("../models/appointments.model");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = express.Router();

function splitDateTime(input) {
  const dateObj = new Date(input);
  if (Number.isNaN(dateObj.getTime())) {
    return null;
  }
  const iso = dateObj.toISOString();
  const [datePart, timePart] = iso.split("T");
  return {
    appointmentDate: datePart,
    appointmentTime: timePart.slice(0, 8),
  };
}

router.post("/", requireAuth, async (req, res) => {
  try {
    const { service, datetime, comment } = req.body;
    if (!service || !datetime) {
      return res.status(400).json({ message: "service and datetime are required." });
    }

    const parsed = splitDateTime(datetime);
    if (!parsed) {
      return res.status(400).json({ message: "Invalid datetime format." });
    }

    const appointment = await createAppointment({
      userId: req.user.id,
      service: String(service).trim(),
      appointmentDate: parsed.appointmentDate,
      appointmentTime: parsed.appointmentTime,
      comment: comment ? String(comment).trim() : null,
    });

    return res.status(201).json({ appointment });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create appointment.", error: error.message });
  }
});

router.get("/my", requireAuth, async (req, res) => {
  try {
    const appointments = await getAppointmentsByUser(req.user.id);
    return res.json({ appointments });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch your appointments.", error: error.message });
  }
});

router.get("/admin/all", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const appointments = await getAllAppointments();
    return res.json({ appointments });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch appointments.", error: error.message });
  }
});

router.patch("/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["new", "confirmed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const updated = await updateAppointmentStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    return res.json({ appointment: updated });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update status.", error: error.message });
  }
});

module.exports = router;
