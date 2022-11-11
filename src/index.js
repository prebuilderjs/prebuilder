import { resolve, restore, start } from './preprocess.js';
import { LogError, LogColor, LogWarn } from './logger';
import { helpString } from './help';
import { parseArgs } from './arg-manager';
import { getConfigOptions } from './config-manager';

global.temp_folder = ".prebuilder-storage"; //"node_modules/.temp";

let paramDefinitions = [
    {
        param: '--dir',
        alias: '-d',
        objectPath: 'dir',
        needsValue: true,
        commands: ['resolve', 'start'],
    },
    {
        param: '--formats',
        alias: '-f',
        objectPath: 'formats',
        needsValue: true,
        canBeList: true,
        commands: ['resolve', 'start'],
    },
    {
        param: '--log',
        objectPath: 'log',
        needsValue: false,
    },
    {
        param: '--preprocessDefines',
        alias: '-defs',
        objectPath: 'preprocessOptions.defines',
        needsValue: true,
        canBeList: true,
        commands: ['resolve', 'start'],
    },
    {
        param: '--preprocessMode',
        alias: '-mode',
        objectPath: 'preprocessOptions.mode',
        needsValue: true,
        canBeList: true,
        commands: ['resolve', 'start'],
    },
    {
        param: '--config',
        alias: '-c',
        objectPath: 'config',
        needsValue: true,
        commands: ['resolve', 'start'],
    },
];
let processInstructions = parseArgs(paramDefinitions);

if (processInstructions) {

    let options = getConfigOptions(processInstructions.params);

    switch (processInstructions.command) {
        case "resolve":{

            if (options.dir) {
            
                resolve(options.dir, options)
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

            if (options.dir) {
                // check first argument is not a known parameter (cmd string is required first)
                if (!paramDefinitions.some( prmDef => prmDef.param == processInstructions.args[1]|| prmDef.alias == processInstructions.args[1])) {
                    
                    start(options.dir, processInstructions.args[1], options)
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

// /**
//  * Restore before changing temp folder !
//  * @param {*} dir 
//  */
// function changeTempDir(dir) {
//     global.temp_folder = dir;
// }

export { resolve, restore, start }; //, changeTempDir };