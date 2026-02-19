const router = require("express").Router();
const auth = require("../middleware/auth");
const emergencyController = require("../controllers/emergencyController");

router.post("/add", auth, emergencyController.addContact);
router.get("/get", auth, emergencyController.getContacts);
router.put("/update/:id", auth, emergencyController.updateContact);
router.delete("/delete/:id", auth, emergencyController.deleteContact);

module.exports = router;
