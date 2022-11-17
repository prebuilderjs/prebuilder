

/**
 * Retrieve a property into an object following a path.
 * @param {Object} obj Object onto witch to search for the property.
 * @param {string} path Path of the property (ex: 'myProp' or 'category.group.myProp').
 * @param {boolean} throwOnError Wether to log an error or throw it.
 * @returns Value of the searched property
 */
 export function getSubProperty(obj, path, throwOnError = false) {
            
    // parse depth layer keys
    let DKeys = path.replaceAll(' ', '').split('.');
    DKeys = DKeys.filter(el => !!el);// remove empty

    // go to prop and modify it
    let prop = obj;

    for (let i = 0; i < DKeys.length; i++) {

        prop = prop[DKeys[i]];

        // stop if prop can't contain sub-props 
        if (!prop || prop.constructor !== Object) {
            if (throwOnError) {
                throw new Error("getSubProperty(): Couldn't reach targeted prop");
            } else {
                console.error(new Error("getSubProperty(): Couldn't reach targeted prop"));
                return undefined;
            }
        }
    }

    return prop;
}

/**
 * Insert a property into an object following a path.
 * @param {Object} obj Object onto witch to insert the property.
 * @param {string} path Path of the property (ex: 'myProp' or 'category.group.myProp').
 * @param {any} value Value of the property.
 * @param {boolean} force Overwrite any value found, & create object if none found in path step.
 * @param {boolean} throwOnError Wether to log an error or throw it.
 * @returns modified obj
 */
export function setSubProperty(obj, path, value, force = true, throwOnError = false) {
    
    // parse depth layer keys
    let DKeys = path.replaceAll(' ', '').split('.');
    DKeys = DKeys.filter(el => !!el);// remove empty

    // go to prop and modify it
    let prop = obj;
    let propDepthLayers = [];

    for (let i = 0; i < DKeys.length; i++) {

        // step in next depth layer
        prop = prop[DKeys[i]];

        // assign value if reached targeted prop
        if (i == DKeys.length - 1) {
            prop = value;

            // if this prop value not an object
        } else if (!prop || prop.constructor !== Object) {
            if (force) {
                // create new object if fordce mode active
                prop = {};
            } else {
                // stop if prop can't contain sub-props 
                if (throwOnError) {
                    throw new Error("setSubProperty(): Couldn't reach targeted prop");
                } else {
                    console.error(new Error("setSubProperty(): Couldn't reach targeted prop"));
                    return obj;
                }
            }
        }

        // save layer
        propDepthLayers.push({ key: DKeys[i], value: prop });
    }

    // reconstruct modified object (necessary as copy by reference parameters unavailable in js)
    let tempObj = {};
    for (let i = propDepthLayers.length - 1; i >= 0; i--) {

        // insert & overwrite deeper layer prop in this one
        if (i < propDepthLayers.length - 1) {
            //prop layer |   next prop's key   | next prop's value
            propDepthLayers[i].value[propDepthLayers[i+1].key] = propDepthLayers[i+1].value;
        }

        // add updated shallower depth layer to temporary return object 
        if (i == 0) {
            // add updated shallower depth layer to root of obj (maintain unkown siblings)
            tempObj = obj;
            tempObj[propDepthLayers[i].key] = propDepthLayers[i].value;
        } else {
            // add updated shallower depth layer to temporary return object 
            tempObj = { [propDepthLayers[i].key] : propDepthLayers[i].value };
        }
    }

    return tempObj;
}

/**
 * Recursively insert properties of an object into another.
 * @param {Object} inObj Object in which to insert the properties.
 * @param {Object} fromObj Object of origin of the properties.
 * @param {(fromProp:any, inProp:any) => boolean} test Test functions that returns true in order to insert property.
 * @param {boolean} overwrite wether to overwrite object propery current values or not.
 * @returns 
 */
 export function insertProps(inObj, fromObj, test = (fromProp) => !!fromProp, overwrite = true) {

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