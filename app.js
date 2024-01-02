import { CronJob } from 'cron';
import logger from './utils/logging.js';
import { connectDB, shutdownDB } from './utils/db.js';
import config from './conf/config.js';
import port from './functions/obisprocessing.js';

const job = new CronJob(
    config.obis.queryInterval, // cronTime
    function () {
        logger.info('Sending read request to GZ1...');
        port.write('/?!\r\n');
    }, // onTick
    null, // onComplete
    true, // start
);

process.on('SIGINT', function () {
    logger.info('Exiting...');
    job.stop();
    shutdownDB().then(() => {
        logger.info('Mongoose shutdown complete');
        process.exit(0);
    });
});

connectDB(() => {
    logger.info('Start reading data, press CTRL+C to exit.');
});
