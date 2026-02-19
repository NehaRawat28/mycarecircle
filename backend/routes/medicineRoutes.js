const router = require("express").Router();

// Medicine routes will be added here
const auth = require("../middleware/auth");
const medicineController = require("../controllers/medicineController");

router.post("/add", auth, medicineController.addMedicine);
router.get("/get", auth, medicineController.getMedicines);

module.exports = router;