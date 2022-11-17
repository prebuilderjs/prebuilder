import { insertProps } from './utils';
const path = require('path');

/**
 * Extract options from current process's parameters, and config file.
 * @param {any} processParameters
 * @returns {}
 */
export function getConfigOptions(processParameters) {

    let config = {};

    // get specified config file, with error report
    if (processParameters.config) {
        try {
            config = require(path.resolve(processParameters.config));
        } catch {
            throw 'Could not find prebuilder config file "' + processParameters.config + '"';
        }
    } else {
        // try get default config file
        try {
            config = require(path.resolve("prebuilder.config.js"));
        } catch {console.log('no config file');}
    }

    // insert with override param options into config options
    insertProps(config, processParameters);

    return config;
}