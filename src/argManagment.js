
import { LogError, LogColor, LogWarn } from './logger';

/**
 * Extract current process' instructions from its arguments list.
 * @param {{param: string, alias?: string, name: string, needsValue: boolean, commands?:Array<string>}} paramDefs 
 * ```txt
 * param:
 * Parameter syntax. ex: --watch
 * 
 * alias:
 * Alternative shorter version of parameter. ex: -w
 * 
 * name:
 * The parameter's alphadecimal object name in the returned value. ex: "watch"
 * 
 * needsValue:
 * Wether this parameter must be followed by a parameter or not
 * 
 * commands:
 * List of commands this parameter is applicable to.
 * ```
 * @returns {{args: Array<string>, command: string, params: {present: boolean, value: any}}|null}
 */
export function parseArgs(paramDefs) {

    let result = { args: process.argv.slice(2) };

    if (result.args.length == 0) return null;

    // check command slot is not a known parameter
    if (!paramDefs.some( prmDef => prmDef.param == result.args[0] || prmDef.alias == result.args[0])) {
        
        result.command = result.args[0];
    }
    
    result.params = SearchForParams(result.command, result.args.slice(1), paramDefs);

    return result;
}

function SearchForParams(command, args, paramDefs) {

    let tempParams = {};
    
    for (let i = 0; i < paramDefs.length; i++) {

        // skip if param is set to work on different command
        if (
            paramDefs[i].commands && (
            (typeof paramDefs[i].commands == 'string' && paramDefs[i].commands != command) || 
            (paramDefs[i].commands instanceof Array && !paramDefs[i].commands.some( cmd => cmd == command)) )
        ) {
            continue;
        }

        let tempParamObj = { present: false, value: undefined };

        // check this param or param alias' presence in current arg list
        let prmIndex = args.indexOf(paramDefs[i].param);
        prmIndex = prmIndex == -1 ? args.indexOf(paramDefs[i].alias) : prmIndex;
        if (prmIndex >= 0) {
            
            tempParamObj.present = true;
                
            // if command needs value
            if (paramDefs[i].needsValue) {

                // if next argument (potential value) is present && if next argument is not a known parameter
                if (
                    args.length >= prmIndex &&
                    !paramDefs.some( prmDef => prmDef.param == args[prmIndex + 1] || prmDef.alias == args[prmIndex + 1])
                ) {
                    tempParamObj.value = args[prmIndex + 1];
                } else {
                    LogError("prebuilder command called with arg: '" + paramDefs[i].param + "' without passing arg value.", false, true);
                }
            }

        } else {
            tempParamObj.present = false;
        }

        // push
        tempParams[paramDefs[i].name] = tempParamObj;
    }

    return tempParams;
}