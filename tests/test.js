/**COLLECTIONS */
const CtnGroup = require('../collections/ctnGroup')
/**LOCAL MODULES */
const { debug } = require('../services/logger')
const util = require('../services/util')
const databasInit = require('../services/databaseInit')

util.connectToMongodb()

// CtnGroup.create({
//   groupname: 'Defense'
// })
//   .then(data => {
//     debug(JSON.stringify(data, null, '\t'))
//   })
//   .catch(err => {
//     warn(JSON.stringify(err, null, '\t'))
//   })

// CtnGroup.findOneAndDelete({
//   groupname: 'Defense'
// })
//   .then(data => {
//     debug(JSON.stringify(data, null, '\t'))
//   })
//   .catch(err => {
//     warn(JSON.stringify(err, null, '\t'))
//   })

// debug(new Date())
// debug(Date.parse(new Date()))

databasInit.listInit()
databasInit.ruleInit()
