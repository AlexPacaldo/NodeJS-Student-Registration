const express = require('express')
const router = express.Router();
const registration_controller = require('../controllers/auth_account')

router.post("/login", registration_controller.loginAccount);
router.post("/register", registration_controller.addAccount);
router.get("/updateform/:email", registration_controller.updateform);
router.post("/updateStudent", registration_controller.updateStudent);
router.get("/deleteStudent/:email", registration_controller.deleteStudent);
router.get("/logout", registration_controller.logoutAccount);
router.post("/addStudent", registration_controller.addStudent);

module.exports = router