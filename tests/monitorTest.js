/**COLLECTIONS */
const MonitorRule = require('../collections/monitorRule')
const MonitorList = require('../collections/monitorList')
const CtnGroup = require('../collections/ctnGroup')
/**LOCAL MODULES */
const { connectToMongodb } = require('../services/util')
const monitorServices = require('../services/monitorServices')
const databaseInit = require('../services/databaseInit')
const { debug, info, warn, error } = require('../services/logger')

connectToMongodb()

// let pros = [MonitorRule.find({ isUpdate: true }), MonitorList.find({ isUpdate: true }), CtnGroup.find({ isUpdate: true })]
// Promise.all(pros)
//   .then(monitorServices.updateConf)
//   .then(data => {
//     debug(JSON.stringify(data, null, '\t'))
//   })
//   .catch(err => {
//     error(JSON.stringify(err.stack, null, '\t'))
//   })

// MonitorRule.updateMany(
//   {
//     isUpdate: true
//   },
//   {
//     $set: {
//       isUpdate: false
//     }
//   },
//   {
//     new: true
//   }
// )
//   .then(doc => {
//     return new Promise((resolve, reject) => {
//       if (doc) {
//         resolve(doc)
//       } else {
//         throw new Error(`No such rule`)
//       }
//     })
//   })
//   .then(data => {
//     debug(JSON.stringify(data, null, '\t'))
//   })
//   .catch(err => {
//     error(JSON.stringify(err, null, '\t'))
//   })

// let pros = []
// monitorServices.lists.forEach(list => {
//   pros.push(MonitorList.create(list))
// })
// Promise.all(pros)
//   .then(() => {
//     info(`init complete`)
//   })
//   .catch(err => {
//     error(err)
//   })

// MonitorRule.find()
//   .select({
//     _id: 0,
//     rule: 1,
//     desc: 1,
//     basicCondition: 1,
//     output: 1,
//     priority: 1,
//     tags: 1
//   })
//   .then(data => {
//     debug(JSON.stringify(data, null, '\t'))
//   })
//   .catch(err => {
//     error(JSON.stringify(err, null, '\t'))
//   })

// MonitorList.find()
//   .select({
//     _id: 0,
//     list: 1,
//     rulename: 1,
//     items: 1
//   })
//   .then(data => {
//     debug(JSON.stringify(data, null, '\t'))
//   })
//   .catch(err => {
//     error(JSON.stringify(err, null, '\t'))
//   })

// databaseInit
//   .ruleInit()
//   .then()
//   .catch(err => {
//     error(err)
//   })

// MonitorRule.findOneAndUpdate(
//   {
//     // list: 'unlogin_containers'
//     rule: 'Created file blew key directorys'
//   },
//   {
//     $set: {
//       output: `Created a new file  below key directorys (user=%user.name
//         command=%proc.cmdline directory=%evt.arg.path arg0=%evt.arg[0]
//         arg1=%evt.arg[1] args=%evt.args containerid=%container.id
//         container=%container.name user=%user.name command=%proc.cmdline
//         file=%fd.name parent=%proc.pname pcmdline=%proc.pcmdline
//         gparent=%proc.aname[2] dirs=%fd.directory flags=%evt.arg.flags
//         type1=%evt.type mode=%evt.arg.mode)`
//     }
//   }
// )
//   .then(data => {
//     debug(JSON.stringify(data, null, '\t'))
//   })
//   .catch(err => {
//     error(JSON.stringify(err, null, '\t'))
//   })

// monitorServices.test()

MonitorRule.listIndexes()
  .then(data => {
    debug(JSON.stringify(data, null, '\t'))
  })
  .catch(err => {
    error(JSON.stringify(err, null, '\t'))
  })
