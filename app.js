import { SerialPort } from 'serialport';
import { DelimiterParser } from '@serialport/parser-delimiter';
import { CronJob } from 'cron';
import logger from './utils/logging.js';
import { connectDB, shutdownDB } from './utils/db.js';
import obisGasValue from './schemas/obisGasValue.js';
import config from './conf/config.js';

const regExBalance = /7-0:3\.0\.0\((\d*\.\d*)\*m3\)/g;
const regExConsumption = /7-0:1\.7\.0\((\d*\.\d*)\*m3\/h\)/g;

const port = new SerialPort({
    path: config.obis.devicePath,
    baudRate: config.obis.baudRate,
});

logger.info(`SerialPort for ${config.obis.devicePath} created.`);

const parser = port.pipe(new DelimiterParser({ delimiter: '!' }));

parser.on('data', function (data) {
    logger.info('Processing response...');
    let ds = data.toString('ascii');
    let balance = parseFloat([...ds.matchAll(regExBalance)][0][1]);
    let consumption = parseFloat([...ds.matchAll(regExConsumption)][0][1]);
    logger.info(`Balance: ${balance.toFixed(2)} Consumption: ${consumption.toFixed(2)}`);
    let gasValue = new obisGasValue();
    gasValue.deviceId = config.obis.deviceId;
    gasValue.balance = balance;
    gasValue.consumption = consumption;
    gasValue.save()
        .then((savedGasValue) => {
            logger.info(`Values saved with ID ${savedGasValue.id}`);
        });
});

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
