const preprocess = require('@prebuilder/lib').default;
const fs = require('fs');
const path = require('path');

import { getFiles, cacheFile, restoreFile, emptyCache, removeFromCache } from './fileManagment';
import { LogError, LogColor, LogWarn, LogCond } from './logger';



export function resolveScripts(db, sourceDir, options) {
    try {
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

        return {
            success: true,
            db: db
        };

    } catch (err) {
        return {
            success: false,
            error: err,
            db: db
        };
    }
}


export function restoreScripts(db, options) {
    
    // move and overwrite each file present in cache to its original place in source dir
    try {
        for (let i = 0; i < db.fileList.length; i++) {
            if (db.fileList[i].cached == true) {
    
                db.fileList[i].date = fs.statSync(db.fileList[i].path).mtime;// before restoring or won't resolve next time
    
                LogCond("restoring file " + path.parse(db.fileList[i].path).base + " ...", options.log);
                restoreFile(db.fileList[i].path);
    
                db.fileList[i].cached = false;
            }
        }
    } catch (err) {
        // avoid deleting unrestored cache
        throw err;
    }

    emptyCache();
    db.restored = true;

    return db;
}
