class dbException extends Error {
  constructor(message) {
    super()
    this.message = message
    this.name = this.constructor.name
    this.code = 5005
  }
}

class paramsException extends Error {
  constructor(message) {
    super()
    this.message = message
    this.name = this.constructor.name
    this.code = 5003
  }
}

class clairException extends Error {
  constructor(message) {
    super()
    this.message = message
    this.name = this.constructor.name
    this.code = 5001
  }
}

class unconnectException extends Error {
  constructor(message) {
    super()
    this.message = message
    this.name = this.constructor.name
    this.code = 5002
  }
}

class fileException extends Error {
  constructor(message) {
    super()
    this.message = message
    this.name = this.constructor.name
    this.code = 5004
  }
}

module.exports = {
  dbException,
  paramsException,
  clairException,
  unconnectException,
  fileException
}
