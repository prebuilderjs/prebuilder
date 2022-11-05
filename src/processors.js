const { execSync } = require('child_process');
const { Select, Confirm } = require('enquirer');

import { Load, Save } from './database.js';
import { LogError, LogColor, LogWarn, LogCond } from './logger';
import { resolveScripts, restoreScripts } from './processor-functions';

/**
 * Resolves directives in every script of a given source folder, and caches their original versions.
 * @param {string} sourceDir Source folder's relative path
 * @param {object} options 
 * ```txt
 * formats: Array<string>   (default: ['.js', '.ts'])
 *      List of file formats to preprocess.
 *      Ex:     ['.js', '.ts']  -> default value
 *              '*' or []       -> preprocess all files
 * 
 * preprocessOptions: Object
 *      Preprocessing options.
 * 
 * log: boolean
 *      Enable debug logging.
 * ```
 */
export async function resolve(sourceDir, options = { formats: ['.js', '.ts'], preprocessOptions: {}, log: false}) {
    
    // Check options
    // options.formats = options.formats != '*' && options.formats != [] ? ['.js', '.ts'] : [];
    if (!(typeof options === 'object' && !Array.isArray(options) && options != null)) {
        LogError("invalid options parameter value.", true, true);

    } else if (!options.formats) {
        options.formats = ['.js', '.ts'];

    } else if (options.formats instanceof String) {
        options.formats = options.formats == '*' ? [] : [options.formats];

    } else if (!(options.formats instanceof Array)) {
        LogError("invalid file formats value.", true, true);
    }
    options.log = options.log === true;
    options.preprocessOptions = options.preprocessOptions || {};
    options.preprocessOptions.log = options.log;

    LogCond("\n", options.log);

    // Load DB
    var db = Load();

    // Check user data loss
    if (!db.restored) {
        // LogColor("prebuilder error: couldn't resolve, a set of previously resolved scripts has not been restored yet. \n As a precaution backup your source folder's content before continuing!", 'red', true);
        LogColor("prebuilder error: couldn't resolve, a set of previously resolved scripts has not been restored yet.", 'red', true);

        let choices = [
            "Restore unrestored scripts, and continue (Recommended)",
            // "Delete unrestored scripts, and continue (Unresolved version of some of your scripts will be permanently lost!)",
            "Quit operation"
        ];
        await (new Select({ name: "prebuilder resolve error", message: "Continue with", choices: choices })).run();

        if (choices[0].enabled) {

            LogCond("\nrestoring...", options.log);
            restore(options)
            LogCond("resolving...\n", options.log);

        // } else if (choices[1].enabled) {

        //     let res = await (new Confirm({ message: "Are you sure ?" })).run()
            
        //     if (res) {
        //         // 1) just let unresolved scripts be overwritten, in order to only lose part of them
        //         // console.log("\ndeleting...\n");
        //         // emptyCache();
        //         // db.fileList = [];
        //         // console.log("\nresolving...\n");
                
        //         // 2) just let unresolved scripts be overwritten, in order to only lose part of them
        //         // console.log("\nresolving... (overwrite)\n");

        //         // 3) do nothing & add scripts diff to cached file later (after classifying scripts & before cazching scripts)
        //         // see IDEA_3 comment inside resolveScripts()
        //         console.log("\nresolving... (overwrite)\n");
        //     } else {
        //         LogCond("\naborting...\n", options.log);
        //         return;
        //     }

        } else {

            LogCond("\naborting...\n", options.log);
            return;
        }
    }

    // try resolve
    let processResult = resolveScripts(db, sourceDir, options);
    if (!processResult.success) {
        restoreScripts(processResult.db, options);
        throw processResult.error;
    }

    Save(db);

    LogCond("\n", options.log);
}

/**
 * Restores back original scripts (with unresolved directives).
 * @param {object} options 
 * ```txt
 * log: boolean
 *      Enable debug logging
 * ```
 */
export function restore(options = {}) {
    options.log = options.log === true;
    
    LogCond("\n", options.log);
    var db = Load();

    db = restoreScripts(db, options);

    Save(db);
    LogCond("\n", options.log);
}

/**
 * Resolves scripts, executes a given command, then restores them back.
 * 
 * For executing an npm command use NPX not NPM, example: "npx rollup", for more information read:
 * https://stackoverflow.com/questions/9679932/how-to-use-executables-from-a-package-installed-locally-in-node-modules
 * 
 * Avoid using commands that run continuously, source files will be restored (overwritten) only when command has finished!, this means that
 * any change made to source code while command is running, will be lost!
 * @param {string} sourceDir Source folder's relative path
 * @param {string} command terminal comand to run (on preprocessed code).
 * @param {object} options 
 * ```txt
 * formats: Array<string>   (default: ['.js', '.ts'])
 *      List of file formats to preprocess.
 *      Ex:     ['.js', '.ts']  -> default value
 *              '*' or []       -> preprocess all files
 * 
 * preprocessOptions: Object
 *      Preprocessing options.
 * 
 * log: boolean
 *      Enable debug logging.
 * ```
 */
export async function start(sourceDir, command, options) {
    

    // Resolve
    try {
        await resolve(sourceDir, options);
    } catch (err) {
        LogError("prebuild start error, resolution aborted:", false, false);
        throw err;
    }

    // Exec command
    LogCond("--- Command start", options.log);
    try {
        execSync(command, (err, stdout, stdrr) => {
            console.log(stdout);
            
            if (err) throw err;
            if (stdrr) throw stdrr;
        });
    } catch (err) {
        LogError("prebuilder start sub-command error:\n" + err, false, false);
    }
    LogCond("--- Command end", options.log);

    // Restore
    try {
        restore(options);
    } catch (err) {
        LogError("prebuild start error, could not restore files after resolution:", false, false);
        throw err;
    }
}

