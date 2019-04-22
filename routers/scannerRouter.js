const router = require('express').Router()
const scanner = require('../controllers/scannerCtl')

router.post('/', scanner.getPage)
router.post('/detail', scanner.getImage)
router.post('/image', scanner.getImagePage)

module.exports = router
