const MongoClient = require('mongodb').MongoClient
const state = {
    db: null
}

module.exports.connect = function (done) {
    const url = 'mongodb://localhost:27017'
    const dbname = 'shopping'

    MongoClient.connect(url)
        .then((data) => {
            state.db = data.db(dbname)
            done()
        })
        .catch((err) => {
            console.log('Failed...', err)
        })
}

module.exports.get = function () {
    return state.db
}