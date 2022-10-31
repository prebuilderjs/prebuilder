const preprocess = require('@prebuilder/lib').default;
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Select, Confirm } = require('enquirer');

import { Load, Save } from './database.js';
import { getFiles, cacheFile, restoreFile, emptyCache, removeFromCache } from './fileManagment';
import { LogError, LogColor, LogWarn, LogCond } from './logger';

/**
 * Resolves directives in every script of a given source folder, and caches their original versions.
 * @param {string} sourceDir Source folder's relative path
 * @param {object} options 
 * ```txt
 * formats: Array<string>       List of file formats to preprocess
 *                              ['.js', '.ts']  -> default value
 *                              '*' or []       -> preprocess all files
 * 
 * preprocessOptions: Object    Preprocessing options
 * 
 * log: boolean                 Enable debug logging
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
        //         // see IDEA_3 comment below
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

    LogCond("source dir: " + sourceDir, options.log);
    LogCond("file formats: " + options.formats.join(', '), options.log);

    // Get all source files
    var files = getFiles(sourceDir, { formats: options.formats, recursive: true });
    LogCond("total files: " + files.length, options.log);

    let cFiles;
    if (db.lastSourceDir == sourceDir) {
        // get classified files list
        // knowing which files have been deleted allows to remove them from database & cache
        // knowing which files have been modified allows to avoid useless checks

        // detect deleted files
        let deletedFiles = [];
        for (let i = 0; i < db.fileList.length; i++) {
            // in case files does not contain db.fileList[i] (this method should be faster than using fs.existsSync on [i].path)
            if (!files.includes(db.fileList[i].path)) {
                deletedFiles.push(db.fileList[i]);
            }
        }
        
        // detect new files
        let addedFiles = [];
        for (let i = 0; i < files.length; i++) {
            // in case db.fileList does not contain files[i]
            if (!db.fileList.some( lfile => lfile.path == files[i])) {
                addedFiles.push({
                    path: files[i],
                    date: fs.statSync(files[i]).mtime,
                });
            }
        }
        
        // detect file changes
        let changedFiles = [];
        let unchangedFiles = [];
        for (let i = 0; i < db.fileList.length; i++) {

            // if file has not been deleted
            if (!deletedFiles.includes(db.fileList[i].path)) {

                var currentModDate = fs.statSync(db.fileList[i].path).mtime.toISOString();

                if (db.fileList[i].date != currentModDate) {// for simplicity's sake...
                    changedFiles.push(db.fileList[i]);
                } else {
                    unchangedFiles.push(db.fileList[i]);
                }
            }
        }

        cFiles = { deleted: deletedFiles, added: addedFiles, changed: changedFiles, unchanged: unchangedFiles };
        
    } else {

        emptyCache();
        db.fileList = [];

        // get all files
        let fileObjs = Array.from(files, p => {return {
            path: p,
            date: fs.statSync(p).mtime
        }});
        cFiles = { deleted: [], added: fileObjs, changed: [], unchanged: [] };
    }

    // Manage deleted files
    for (let i = 0; i < cFiles.deleted.length; i++) {
        if (cFiles.deleted[i].cached) {
            removeFromCache(cFiles.deleted[i].path);
        }
    }

    // Manage changed & added files
    let filesToProcess = cFiles.added.concat(cFiles.changed);
    LogCond("files to preprocess: " + filesToProcess.length, options.log);
    if (options.log) {
        console.table({ amount: {deleted: cFiles.deleted.length,
            added: cFiles.added.length,
            changed: cFiles.changed.length,
            unchanged: cFiles.unchanged.length} });
    }
        
    for (let i = 0; i < filesToProcess.length; i++) {
        
        // check if preprocess directives are used in modded file, cache result
        var file = fs.readFileSync(filesToProcess[i].path, 'utf-8');
        let fileSize = file.length;

        // preprocess
        LogCond("\npreprocessing file " + i + ": ", options.log);
        if (options.log) options.preprocessOptions.fileAdress = path.parse(filesToProcess[i].path).base;
        file = preprocess(file, options.preprocessOptions);

        // in case of any change
        if (fileSize != file.length) {

            // IDEA_3
            // if script already cached without having restored
            // if (filesToProcess[i].cached == true) {

            //     // Add new source scripts diff to cached script

            //     // --------

            // } else {
                
                // move source file to .temp folder
                LogCond("caching file " + path.parse(filesToProcess[i].path).base + " ...", options.log);
                cacheFile(filesToProcess[i].path);
            // }


            // save preprocessed file in source path
            fs.writeFileSync(filesToProcess[i].path, file, 'utf-8', (err) => {
                if (err)
                    LogError("couldn't resolve file " + filesToProcess[i].path + "\n" + err, true, true);
            });

            // update cached flag
            filesToProcess[i].cached = true;
        } else {
            filesToProcess[i].cached = false;
        }

        // update date flag
        filesToProcess[i].date = fs.statSync(filesToProcess[i].path).mtime;
    }

    // Update db flag
    db.fileList = filesToProcess.concat(cFiles.unchanged);
    db.restored = false;
    db.lastSourceDir = sourceDir;

    Save(db);

    LogCond("\n", options.log);
}

/**
 * Restores back original scripts (with unresolved directives).
 * @param {object} options 
 * ```txt
 * log: boolean                 Enable debug logging
 * ```
 */
export function restore(options = {}) {
    options.log = options.log === true;
    
    LogCond("\n", options.log);
    var db = Load();
    
    // move and overwrite each file present in cache to its original place in source dir
    for (let i = 0; i < db.fileList.length; i++) {
        if (db.fileList[i].cached == true) {

            db.fileList[i].date = fs.statSync(db.fileList[i].path).mtime;// before restoring or won't resolve next time

            LogCond("restoring file " + path.parse(db.fileList[i].path).base + " ...", options.log);
            restoreFile(db.fileList[i].path);

            db.fileList[i].cached = false;
        }
    }

    emptyCache();
    db.restored = true;

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
 * formats: Array<string>       List of file formats to preprocess
 *                              ['.js', '.ts']  -> default value
 *                              '*' or []       -> preprocess all files
 * 
 * preprocessOptions: Object    Preprocess options
 * 
 * log: boolean                 Enable debug logging
 * ```
 */
export async function start(sourceDir, command, options) {
    
    await resolve(sourceDir, options);

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

    restore(options);
}

