const router = require("express").Router();

const auth = require("../middleware/auth");
const familyController = require("../controllers/familyController");

router.post("/add", auth, familyController.addMember);
router.get("/get", auth, familyController.getMembers);

module.exports = router;