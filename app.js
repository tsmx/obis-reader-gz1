import { SerialPort } from 'serialport';
import { DelimiterParser } from '@serialport/parser-delimiter';
import logger from './utils/logging.js';

const regExBalance = /7-0:3\.0\.0\((\d*\.\d*)\*m3\)/g;
const regExConsumption = /7-0:1\.7\.0\((\d*\.\d*)\*m3\/h\)/g;

const port = new SerialPort({
    path: '/dev/ttyUSB1',
    baudRate: 9600,
});

logger.info('SerialPort for ttyUSB1 created.');

const parser = port.pipe(new DelimiterParser({ delimiter: '!' }));

parser.on('data', function (data) {
    logger.info(`Raw data: ${data}`);
    let ds = data.toString();
    let balance = parseFloat([...ds.matchAll(regExBalance)][0][1]);
    let consumption = parseFloat([...ds.matchAll(regExConsumption)][0][1]);
    logger.info(`Balance: ${balance.toFixed(2)} Consumption: ${consumption.toFixed(2)}`);
});

process.on('SIGINT', function () {
    logger.info('Exiting...');
    process.exit();
});

logger.info('Start reading data, press CTRL+C to exit.');

while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));
}