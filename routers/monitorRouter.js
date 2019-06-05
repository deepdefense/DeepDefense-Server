/**export modules */
const router = require('express').Router()
/**collections */
/**local modules */
const monitorCtrl = require('../controllers/monitorCtrl')
const { debug } = require('../services/logger')

/**get events from source */
// router.post('/getEvent', monitorCtrl.getEvent)
// router.get('/list', monitorCtrl.getLists)
// router.get('/list/:rulename', monitorCtrl.getListByName)
// router.put('/list/:rulename', monitorCtrl.setListByName)
// router.post('/event', monitorCtrl.getEventPage)
// router.post('/status', monitorCtrl.getStatus)
/**container manager */
// router.get('/container', monitorCtrl.getContainerList)
// router.post('/container', monitorCtrl.addContainer)
// router.put('/container', monitorCtrl.setContainer)
// router.delete('/container', monitorCtrl.delContainer)

module.exports = router
