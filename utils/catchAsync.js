// Unlike synchronous, you need to explicitly pass the error in next() for async functions
// This is required for Express 4! This issue is resolved in Express 5 (but as of Jan 2024,
// Express 5 is in the beta release stage and a stable version is not available yet)
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}