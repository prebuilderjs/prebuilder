import { resolve, restore, wrap } from './preprocess.js';
import { LogError, LogColor, LogWarn } from './logger';
import { helpString } from './help';
import { parseArgs } from './arg-manager';
import { getConfigOptions } from './config-manager';
import paramDefinitions from './command-definitions';

global.temp_folder = ".prebuilder-storage";
let processInstructions = parseArgs(paramDefinitions);

if (processInstructions) {

    let options = getConfigOptions(processInstructions.params);

    switch (processInstructions.command) {
        case "resolve":{

            if (options.srcDir) {
            
                resolve(options.srcDir, options)
                    .then().catch(err => console.error(err));
            } else {

                LogError("prebuild error: No source directory has been set, check configuration file or add --scrDir parameter.", false, true);
            }
            break;

        }
        case "restore":{
            restore(options);
            break;
        }
        case "wrap":{

            if (options.srcDir) {
                // check first argument is not a known parameter (cmd string is required first)
                if (!paramDefinitions.some( prmDef => prmDef.param == processInstructions.args[1]|| prmDef.alias == processInstructions.args[1])) {
                    
                    wrap(options.srcDir, processInstructions.args[1], options)
                        .then().catch(err => console.error(err));
                } else {

                    LogError("prebuild error: wrap command called without passing sub-command string first.", false, true);
                }
            } else {
                LogError("prebuild error: No source directory has been set, check configuration file or add --scrDir parameter.", false, true);
            }
            break;

        }
        case "--help":{

            console.log(helpString);
            break;

        }
        default:
            LogError("prebuild called without any command argument.", false, true);
    }
}

export { resolve, restore, wrap };