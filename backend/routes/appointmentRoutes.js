const router = require("express").Router();
const auth = require("../middleware/auth");
const appointmentController = require("../controllers/appointmentController");

router.post("/add", auth, appointmentController.addAppointment);
router.get("/get", auth, appointmentController.getAppointments);
router.put("/update/:id", auth, appointmentController.updateAppointment);
router.delete("/delete/:id", auth, appointmentController.deleteAppointment);

module.exports = router;
