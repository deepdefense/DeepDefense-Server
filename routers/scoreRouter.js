const router = require('express').Router()
const scoreCtl = require('../controllers/scoreCtrl')

router.get('/', scoreCtl.getScore)
router.put('/', scoreCtl.setScore)
// router.post('/', scoreCtl.addScore);

module.exports = router
