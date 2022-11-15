const fs = require('fs');
const path = require('path');
const winattr = require('winattr');
import { LogError, LogColor, LogWarn } from './logger';


export function Load() {

    var db;
    
    if (fs.existsSync(path.join(temp_folder, 'prebuilder-db.json'))) {
        
        // return existing db object
        db = fs.readFileSync(path.join(temp_folder, 'prebuilder-db.json'), 'utf-8');
        db = JSON.parse(db);

    } else {

        // return new db object
        db = defaultDB();
        Save(db, temp_folder);
    }

    // db.Empty = () => { db.fileList = []; };

    Object.defineProperty( db, 'Empty', {
        value: function () { this.fileList = []; },
        writable: true,
        configurable: true
    });

    return db;
}


export function Save(data) {

    if (!fs.existsSync(temp_folder)) {
        fs.mkdirSync(temp_folder, { recursive: true });
        try {
            winattr.setSync(temp_folder, {hidden:true});
        } catch {}
    }
    
    fs.writeFileSync(path.join(temp_folder, 'prebuilder-db.json'), JSON.stringify(data, null, '\t'), 'utf-8', (err) => {
        if (err)
            LogError("prebuilder error: could not save database:\n" + err, true, true);
    });
    
}

export function defaultDB() {

    return {
        restored: true,
        fileList: [],
    }
}