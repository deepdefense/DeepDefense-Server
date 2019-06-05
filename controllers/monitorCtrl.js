/**collections */
/**local modules */
const { debug, info, warn, error } = require('../services/logger')
const { resSuc, resErr } = require('../services/util')
const { dbException, paramsException, unconnectException } = require('../class/exceptions')

/**
 * @param: {
 *   "output": "09:44:58.944053051: Debug Shell spawned by untrusted binary (user=root shell=sh parent=httpd cmdline=sh -c ls > /dev/null pcmdline=httpd --action spawn_shell --interval 0 --once gparent=event_generator ggparent=<NA> aname[4]=<NA> aname[5]=<NA> aname[6]=<NA> aname[7]=<NA>)",
 *   "priority": "Debug",
 *   "rule": "Run shell untrusted",
 *   "time": "2019-05-24T09:44:58.944053051Z",
 *   "output_fields": {
 *      "evt.time": 1558691098944053000,
 *      "proc.aname[2]": "event_generator",
 *      "proc.aname[3]": null,
 *      "proc.aname[4]": null,
 *      "proc.aname[5]": null,
 *      "proc.aname[6]": null,
 *      "proc.aname[7]": null,
 *      "proc.cmdline": "sh -c ls > /dev/null",
 *      "proc.name": "sh",
 *      "proc.pcmdline": "httpd --action spawn_shell --interval 0 --once",
 *      "proc.pname": "httpd",
 *      "user.name": "root"
 *  }
 * } req.body
 */
const getEvent = (req, res) => {}

// const

module.exports = {
  getEvent
}
