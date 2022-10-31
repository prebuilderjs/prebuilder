// const { resolve, restore, start } = require('./processors.js');
import { resolve, restore, start } from './processors.js';
import { LogError, LogColor, LogWarn } from './logger';
import { helpString } from './help';

const [,, ...args] = process.argv;
global.temp_folder = ".prebuilder-storage"; //"node_modules/.temp";
let paramDefinitions = [
    {
        cmd: '--dir',
        name: 'dir',
        needsValue: true,
    },
    {
        cmd: '--formats',
        name: 'formats',
        needsValue: true,
    },
    {
        cmd: '--log',
        name: 'log',
        needsValue: false,
    },
    {
        cmd: '--preprocessDefines',
        name: 'preprocessDefines',
        needsValue: true,
    },
]

if (args.length >= 1) {

    let currentParams = SearchArgsForParams(paramDefinitions);
    let options = makeOptions(currentParams);

    switch (args[0]) {
        case "resolve":{

            if (currentParams.dir.present) {

                resolve(currentParams.dir.value, options)
                    .then().catch(err => console.error(err));
            } else {

                LogError("prebuilder resolve command called without passing source dir.", false, true);
            }
            break;

        }
        case "restore":{
            restore(options);
            break;
        }
        case "start":{

            if (currentParams.dir.present) {
                // check first argumant is not a known parameter (cmd string is required first)
                if (!paramDefinitions.some( cmdDef => cmdDef.cmd == args[1])) {
                    
                    start(currentParams.dir.value, args[1], options)
                        .then().catch(err => console.error(err));
                } else {

                    LogError("prebuilder start command called without passing sub-command string first.", false, true);
                }
            } else {
                LogError("prebuilder start command called without passing source dir.", false, true);
            }
            break;

        }
        case "--help":{

            console.log(helpString);
            break;

        }
        default:
            LogError("prebuilder called without any command argument.", false, true);
    }
}

function makeOptions(currentParams) {
    let options = {};
    
    // formats
    if (currentParams.formats.present) {
        try {
            options.formats = currentParams.formats.value.replaceAll(' ', '').split(',');
        } catch (err) {
            LogError("prebuilder error: invalid --formats arg value, value must be a string \".js\" or \".js, .ts\".\n" + err, false, true);
        }
    }
    
    // log
    options.log = currentParams.log.present;
    
    // preprocess options
    options.preprocessOptions = {};
    if (currentParams.preprocessDefines.present) {
        try {
            options.preprocessOptions.defines = currentParams.preprocessDefines.value.replaceAll(' ', '').split(',');
        } catch (err) {
            LogError("prebuilder error: invalid --preprocessDefines arg value, value must be a string \"MY_DEFINE\" or \"DEFINE1, DEFINE2\".\n" + err, false, true);
        }
    }

    return options;
}

function SearchArgsForParams(paramDefinitions) {

    let tempParams = {};
    
    for (let i = 0; i < paramDefinitions.length; i++) {

        let parameterObj = { present: false, value: undefined };

        // if this command definition's cmd present in current arg list
        let prmIndex = args.indexOf(paramDefinitions[i].cmd)
        if (prmIndex >= 0) {
            
            parameterObj.present = true;
                
            // if command needs value
            if (paramDefinitions[i].needsValue) {

                // if next argument (potential value) is present && if next argument is not a known parameter
                if (args.length >= prmIndex && !paramDefinitions.some( prmDef => prmDef.cmd == args[prmIndex + 1])) {
                    parameterObj.value = args[prmIndex + 1];
                } else {
                    LogError("prebuilder command called with arg: '" + paramDefinitions[i].cmd + "' without passing arg value.", false, true);
                }
            }

        } else {
            parameterObj.present = false;
        }

        // push
        tempParams[paramDefinitions[i].name] = parameterObj;
    }

    return tempParams;
}

// /**
//  * Restore before changing temp folder !
//  * @param {*} dir 
//  */
// function changeTempDir(dir) {
//     global.temp_folder = dir;
// }

export { resolve, restore, start }; //, changeTempDir };