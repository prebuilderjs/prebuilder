import { resolve, restore, start } from './preprocess.js';
import { LogError, LogColor, LogWarn } from './logger';
import { helpString } from './help';
import { parseArgs } from './arg-manager';

global.temp_folder = ".prebuilder-storage"; //"node_modules/.temp";

let paramDefinitions = [
    {
        param: '--dir',
        alias: '-d',
        name: 'dir',
        needsValue: true,
        commands: ['resolve', 'start'],
    },
    {
        param: '--formats',
        alias: '-f',
        name: 'formats',
        needsValue: true,
        commands: ['resolve', 'start'],
    },
    {
        param: '--log',
        name: 'log',
        needsValue: false,
    },
    {
        param: '--preprocessDefines',
        alias: '-defs',
        name: 'preprocessDefines',
        needsValue: true,
        commands: ['resolve', 'start'],
    },
];
let processInstructions = parseArgs(paramDefinitions);

if (processInstructions) {

    let options = makeOptions(processInstructions.params);

    switch (processInstructions.command) {
        case "resolve":{

            if (processInstructions.params.dir.present) {

                resolve(processInstructions.params.dir.value, options)
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

            if (processInstructions.params.dir.present) {
                // check first argument is not a known parameter (cmd string is required first)
                if (!paramDefinitions.some( prmDef => prmDef.param == processInstructions.args[1]|| prmDef.alias == processInstructions.args[1])) {
                    
                    start(processInstructions.params.dir.value, processInstructions.args[1], options)
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

// /**
//  * Restore before changing temp folder !
//  * @param {*} dir 
//  */
// function changeTempDir(dir) {
//     global.temp_folder = dir;
// }

export { resolve, restore, start }; //, changeTempDir };