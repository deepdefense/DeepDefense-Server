class dbException extends Error {
    constructor(message) {
        super();
        this.message = message;
        this.name = this.constructor.name;
        this.code = 5005;
    }
};

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
        this.name = this.constructor.name,
        this.code = 5001
    }
}

module.exports = {
    dbException,
    paramsException,
    clairException
}