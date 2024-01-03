// This is a custom error which takes in a message and an error status code
class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

// Export ExpressError
module.exports = ExpressError;