import mongoose from 'mongoose';
import logger from '../utils/logging.js';
import config from '../conf/config.js';

const dbconfig = config.database;

const dbURI = dbconfig.protocol + '://' + dbconfig.server + (dbconfig.port ? (':' + dbconfig.port) : ('')) + '/' + dbconfig.database;
const dbOptions = {
    user: dbconfig.user,
    pass: dbconfig.password
};

// Create the database connection 
function connect(cb) {
    logger.info('Trying to connect to ' + dbURI);
    mongoose.connect(dbURI, dbOptions);
    var db = mongoose.connection;
    db.on('error', function (err) {
        logger.error('Mongoose default connection error: ' + err);
        process.exit(1);
    });
    db.on('disconnected', function () {
        logger.info('Mongoose default connection disconnected');
    });
    db.once('open', function () {
        logger.info('Mongoose default connection open to ' + dbURI);
        cb();
    });
}

function shutdown() {
    return mongoose.connection.close();
}

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function () {
    shutdown();
});

export function connectDB (cb) { connect(cb); }
export function shutdownDB () { return shutdown(); }
export default mongoose;