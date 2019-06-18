/**EXPORT MODULES */
const router = require('express').Router()
/**LOCAL MODULES */
const monitorCtrl = require('../controllers/monitorCtrl')
const ctnGroupCtrl = require('../controllers/ctnGroupCtrl')
const backupCtrl = require('../controllers/backupCtrl')

/**EVENT */
router.post('/getEvent', monitorCtrl.getEventPage)
/**LIST */
router.get('/rules', monitorCtrl.getRuleList)
router.get('/rules/:rulename', monitorCtrl.getListByRule)
router.put('/rules/:rulename', monitorCtrl.setListByRule)
router.post('/monitor/stats', monitorCtrl.getStats)
router.put('/rules', monitorCtrl.setRule)
router.post('/rules/enable', monitorCtrl.enableRules)

/**CONTAINER GROUP MANAGE */
router.get('/container', ctnGroupCtrl.getCtnGroupList)
router.post('/container', ctnGroupCtrl.createCtnGroup)
router.put('/container', ctnGroupCtrl.setCtnGroup)
router.delete('/container/:groupname', ctnGroupCtrl.deleteCtnGroup)

/**COPY AND BACK */
router.get('/snapshot', backupCtrl.getBackupList)
router.post('/snapshot/:id', backupCtrl.createBackup)
router.delete('/snapshot/:id', backupCtrl.deleteBackup)
router.post('/snapshot/restore/:id', backupCtrl.recoverBackup)

module.exports = router
