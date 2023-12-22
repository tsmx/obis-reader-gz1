import secureConfig from '@tsmx/secure-config';
const conf = secureConfig();

import logger from '../utils/logging.js';


if (conf != null) {
    logger.info('Using configuration ' + conf.name + '...');
}
else {
    logger.error('Could not load configuration!');
}

export default conf;