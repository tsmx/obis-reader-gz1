import mongoose from '../utils/db.js';
import config from '../conf/config.js';

var obisGasValues = mongoose.Schema({
    date: { type: Date, default: Date.now, index: true },
    deviceid: { type: String, default: 'GZ1', index: true },
    balance: Number,
    balanceUnit: { type: String, default: 'm3' },
    consumption: Number,
    consumptionUnit: { type: String, default: 'm3/h' }
});

// compile & export the master data model
export default mongoose.model('obisgasvalues', obisGasValues, config.database.collection); 