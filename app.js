import { SerialPort } from 'serialport';
import { DelimiterParser } from '@serialport/parser-delimiter';
import logger from './utils/logging.js';

const regExBalance = /\(\d*\.\d*\*m3\)/;
const regExConsumption = /\(\d*\.\d*\*m3\/h\)/;

const port = new SerialPort({
    path: '/dev/ttyUSB1',
    baudRate: 9600,
});

logger.info('SerialPort for ttyUSB1 created.');

const parser = port.pipe(new DelimiterParser({ delimiter: '!' }));

parser.on('data', function (data) {
    logger.info(`Raw data: ${data}`);
    let dataString = data.toString();
    let balanceString = dataString.match(regExBalance)[0];
    let balance = parseFloat(balanceString.substring(1, balanceString.length - 4));
    let consumptionString = dataString.match(regExConsumption)[0];
    let consumption = parseFloat(consumptionString.substring(1, consumptionString.length - 6));
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

