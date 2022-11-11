// import { LogError, LogColor, LogWarn } from './logger';

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
            config = require("../" + processParameters.config);
        } catch {
            throw 'Could not find prebuilder config file "' + processParameters.config + '"';
        }
    } else {
        // try get default config file
        try {
            config = require('../prebuilder.config.js');
        } catch {console.log('no config file');}
    }

    // insert with override param options into config options
    insertProps(config, processParameters);

    return config;
}

/**
 * Recursively insert properties of an object into another.
 * @param {Object} inObj Object in which to insert the properties.
 * @param {Object} fromObj Object of origin of the properties.
 * @param {(fromProp:any, inProp:any) => boolean} test Test functions that returns true in order to insert property.
 * @param {boolean} overwrite wether to overwrite object propery current values or not.
 * @returns 
 */
function insertProps(inObj, fromObj, test = (fromProp) => !!fromProp, overwrite = true) {

    for (const param in fromObj) {

        if (param == 'config') continue;

        // overwrite check
        if (!inObj[param] || overwrite) {

            // if prop can contain sub-props
            if (!!fromObj[param] && fromObj[param].constructor === Object) {
                
                // insert content
                inObj[param] = inObj[param] || {};
                inObj[param] = insertProps(inObj[param], fromObj[param], test, overwrite);

            } else {
                // insert
                if (test(fromObj[param], inObj[param])) {
                    inObj[param] = fromObj[param];
                }
            }
        }
    }
    return inObj;
}