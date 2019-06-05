const router = require('express').Router()
const repository = require('../controllers/repositoryCtrl')

router.get('/', repository.getRepositoryList)
router.post('/', repository.addRepository)
router.put('/', repository.setRepository)
router.delete('/', repository.removeRepository)
router.put('/test', repository.testRepository)

module.exports = router
