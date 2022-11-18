const { exec, execSync } = require('child_process');
const { Select, Confirm } = require('enquirer');
const chokidar = require('chokidar');

import { Load, Save } from './database.js';
import { LogError, LogColor, LogWarn, LogCond } from './logger';
import { resolveScripts, restoreScripts } from './preprocess-functions';
import { setSubProperty } from './utils';

/**
 * Resolves directives in every script of a given source folder, and caches their original versions.
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
export async function resolve(options = { formats: ['.js', '.ts'], preprocessOptions: {}, log: false}) {
    
    // Check options
    if (!(typeof options === 'object' && !Array.isArray(options) && options != null)) {
        LogError("invalid options parameter value.", true, true);

    } else if (!options.formats) {
        options.formats = ['.js', '.ts'];

    } else if (options.formats instanceof String) {
        options.formats = options.formats == '*' ? [] : [options.formats];

    } else if (!(options.formats instanceof Array)) {
        LogError("invalid file formats value.", true, true);
    }

    if (!options.srcDir) {
        LogError("prebuild error: No source directory has been set, check configuration file or add --scrDir parameter.", false, true);
        
    } else if (!options.onTheSpot && !options.outDir) {
        LogError("prebuild error: No output directory has been set, check configuration file or add --outDir parameter.", false, true);
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
    let processResult = resolveScripts(db, options);
    // auto-restore on error
    if (!processResult.success && options.onTheSpot) {
        restoreScripts(processResult.db, options);
        throw processResult.error;// throw to stop exec when called in wrap()
    }

    Save(processResult.db);

    LogCond("\n", options.log);

    if (options.watch && !options.onTheSpot) {
        LogColor("prebuilder in watch mode...\n", 'cyan');

        if (!global.watcher) {
            global.watcher = chokidar.watch(options.srcDir, {persistent: true, awaitWriteFinish: true, });
            global.watcher.on('add', () => { resolve(options); })
                .on('change', () => { resolve(options); })
                .on('unlink', () => { resolve(options); })
                .on('error', (err) => { throw err; });
        }
    }
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
export async function wrap(command, options) {
    
    // Resolve
    try {
        await resolve(setSubProperty(options, 'watch', false));
    } catch (err) {
        // LogError("prebuild wrap error: preprocess resolution aborted\n", false, false);
        // throw err;

        LogError("prebuild wrap error: preprocess resolution aborted\n", false, true);
    }

    // Exec command
    if (!options.watch || // run anytime
        (options.watch && !options.wrap_RunCmdFirstTimeOnly) || // watch + run anytime
        (options.watch && options.wrap_RunCmdFirstTimeOnly && !global.didRunCmdFirstTimeOnly)) { // watch + run first time
        

        LogCond("--- Command wrap", options.log);
        try {
            if (options.wrap_RunCmdInParallel) {

                exec(command, (err, stdout, stdrr) => {
                    console.log(stdout);
                    
                    if (err) throw err;
                    if (stdrr) throw stdrr;
                });
                
            } else {
                
                execSync(command, (err, stdout, stdrr) => {
                    console.log(stdout);
                    
                    if (err) throw err;
                    if (stdrr) throw stdrr;
                });
            }
        } catch (err) {
            LogError("prebuild wrap error: sub-command run with error:\n" + err, false, false);
        }
        LogCond("--- Command end", options.log);


        global.didRunCmdFirstTimeOnly = true;
    }

    // Restore
    if (options.onTheSpot) {
        try {
            restore(options);
        } catch (err) {
            LogError("prebuild wrap error: could not restore files\n", false, false);
            throw err;
        }
    } else if (options.watch) {
        LogColor("prebuilder in watch mode...\n", 'cyan');

        if (!global.watcher) {
            global.watcher = chokidar.watch(options.srcDir, {persistent: true, awaitWriteFinish: true,  });
            global.watcher.on('add', () => { wrap(command, options); })
                .on('change', () => { wrap(command, options); })
                .on('unlink', () => { wrap(command, options); })
                .on('error', (err) => { throw err; });
        }
    }
}

