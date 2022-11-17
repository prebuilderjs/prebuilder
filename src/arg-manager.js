
import { LogError, LogColor, LogWarn } from './logger';
import { setSubProperty } from './utils';


/**
 * Extract current process' instructions from its arguments list.
 * @param {{param: string, alias?: string, objectPath: string, needsValue: boolean, canBeList?: boolean, commands?:Array<string>}} paramDefs 
 * ```txt
 * param:
 * Parameter syntax. ex: --watch
 * 
 * alias:
 * Alternative shorter version of parameter. ex: -w
 * 
 * objectPath:
 * object name or path over which it will be accessible in returned object. ex: "watch" or "cliOptions.compilation.watch"
 * 
 * needsValue:
 * Wether this parameter must be followed by a value or not
 * 
 * canBeList:
 * Wether this parameter's value can be a list separated by commas or not. ex: --formats ".js, .ts"
 * 
 * commands:
 * List of commands this parameter is applicable to.
 * ```
 * @returns {{args: Array<string>, command: string, params: {present: boolean, value: any}}|null}
 */
export function parseArgs(paramDefs) {

    // args
    let result = { args: process.argv.slice(2) };
    
    // command
    if (!!result.args.length) {
        // check command slot is not a known parameter
        if (!paramDefs.some( prmDef => prmDef.param == result.args[0] || prmDef.alias == result.args[0])) {
            
            result.command = result.args[0];
        } else
            result.command = null;
    } else
        result.command = null;
    
    // params
    result.params = SearchForParams(result.command, result.args, paramDefs);

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

        let tempParamObj = paramDefs[i].needsValue ?  undefined : false;

        // check this param or param alias' presence in current arg list
        let prmIndex = args.indexOf(paramDefs[i].param);
        prmIndex = prmIndex == -1 ? args.indexOf(paramDefs[i].alias) : prmIndex;
        if (prmIndex >= 0) {
                
            // if command needs value
            if (paramDefs[i].needsValue) {

                // if next argument (potential value) is present && if next argument is not a known parameter
                if (
                    args.length >= prmIndex &&
                    !paramDefs.some( prmDef => prmDef.param == args[prmIndex + 1] || prmDef.alias == args[prmIndex + 1])
                ) {
                    if (paramDefs[i].canBeList) {
                        
                        try {
                            tempParamObj = args[prmIndex + 1].replaceAll(' ', '').split(',');
                        } catch (err) {
                            LogError("prebuilder error: invalid "+ paramDefs[i].param +" arg value, value must be a string ex: \"value\" or \"value1, value2\".\n" + err, false, true);
                        }
                    } else {
                        tempParamObj = args[prmIndex + 1];
                    }
                } else {
                    LogError("prebuilder command called with parameter: '" + paramDefs[i].param + "' without passing parameter's value.", false, true);
                }
            } else {
                tempParamObj = true;
            }
        }

        // push
        tempParams = setSubProperty(tempParams, paramDefs[i].objectPath, tempParamObj);
    }

    return tempParams;
}