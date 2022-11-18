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

    // if (options.watch && !options.onTheSpot) {
    //     let watcher = chokidar.watch(options.srcDir, {persistent: true});
    // }

    switch (processInstructions.command) {
        case "resolve":{

            resolve(options)
                .then().catch(err => console.error(err));
            break;
        }
        case "restore":{
            restore(options);
            break;
        }
        case "wrap":{
            // check first argument is not a known parameter (cmd string is required first)
            if (!paramDefinitions.some( prmDef => prmDef.param == processInstructions.args[1]|| prmDef.alias == processInstructions.args[1])) {
                
                wrap(processInstructions.args[1], options)
                    .then().catch(err => console.error(err));
            } else {

                LogError("prebuild error: wrap command called without passing sub-command string first.", false, true);
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