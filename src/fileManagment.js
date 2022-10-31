
const fs = require('fs');
const path = require('path');
import { LogError, LogColor, LogWarn } from './logger';

/**
 * Collect files in a given folder.
 * @param {string} folder Folder to search into
 * @param {{formats: string|Array<string>, recursive: boolean}} options 
 * ```txt
 * formats: string|Array<string>    File extentions to search for (to ignore extention assign value null or [ ])
 *                                      ex: '.txt' or ['.txt', '.js']
 * 
 * recursive: boolean               Wether to search in sub-folders or not
 * ```
 * @returns {Array<string>}
 */
export function getFiles(folder, options = { formats: null, recursive: false }) {

    let { formats = [], recursive = false } = options;

    if (formats instanceof String) {
        formats = formats? [formats] : [];

    } else if (!(formats instanceof Array)) {
        LogError("invalid file formats value.", true, true);
    }
    
    var _files = [];
    var endpoints = fs.readdirSync(folder);

    for (let i = 0; i < endpoints.length; i++) {
        let name = endpoints[i];
        let adress = path.join(folder, name);

        if (recursive && fs.statSync(adress).isDirectory()) {
            // merge contents of folder
            _files = _files.concat( getFiles(adress, options) );
            
        } else if (formats.length == 0 || (formats.length > 0 && formats.includes(path.extname(name))) ) {
            // include file
            _files.push(adress);
        }
    }

    return _files;
}

function moveFile(from, to) {

    // create directory if inexistent
    if (!fs.existsSync( path.parse(to).dir )) {
        fs.mkdirSync( path.parse(to).dir , { recursive: true })
    }

    // move
    fs.renameSync(from, to, (err) => {
        if (err)
            LogError("couldn't move file " + from + "\n" + err, true, true);
    });
}

export function cacheFile(filePath) {

    moveFile(filePath, path.join(temp_folder, 'prebuilder-files', filePath));
}

export function restoreFile(filePath) {

    moveFile(path.join(temp_folder, 'prebuilder-files', filePath), filePath);
}

export function emptyCache() {
    var endpoints = fs.readdirSync(temp_folder);

    for (let i = 0; i < endpoints.length; i++) {
        
        // delete anything but db file
        if (endpoints[i] != 'prebuilder-db.json') {
            
            removeFromCache(endpoints[i]);
        }
    }
}

export function removeFromCache(filePath) {
    
    fs.rmSync(path.join(temp_folder, filePath), {recursive: true, force: true })
}