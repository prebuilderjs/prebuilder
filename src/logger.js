
/**
 * 
 * @param {string} text Text to log
 * @param {boolean} stack Wether to log callstack or not [default = true]
 * @param {boolean} doThrow Wether to throw execution, or keep going after this log [default = false]
 */
export function LogError(text, stack = true, doThrow = true) {
    if (stack) {
        
        console.error(new Error("\x1b[31m" + text + "\x1b[0m"));
    } else {
        
        console.error("\x1b[31m" + text + "\x1b[0m");
    }

    if (doThrow) {
        throw text;
    }
}

/**
 * 
 * @param {string} text Text to log 
 */
export function LogWarn(text) {
    
    console.warn("\x1b[33m" + text + "\x1b[0m");
}

/**
 * 
 * @param {string} text Text to log
 * @param {string} color 
 * ```txt
 * - black      - yellow        - cyan
 * - red        - blue          - white
 * - green      - magenta
 * ```
 * @param {boolean} background Wether to color background (true) or foreground (false, default)
 * @param {boolean} condition Wether to log or not (default = true)
 */
export function LogColor(text, color, background = false, condition = true) {

    let col = '';
    
    switch (color) {
        case 'black':
            col = "\x1b[" + (background? '4' : '3') + "0m";
            break;
        case 'red':
            col = "\x1b[" + (background? '4' : '3') + "1m";
            break;
        case 'green':
            col = "\x1b[" + (background? '4' : '3') + "2m";
            break;
        case 'yellow':
            col = "\x1b[" + (background? '4' : '3') + "3m";
            break;
        case 'blue':
            col = "\x1b[" + (background? '4' : '3') + "4m";
            break;
        case 'magenta':
            col = "\x1b[" + (background? '4' : '3') + "5m";
            break;
        case 'cyan':
            col = "\x1b[" + (background? '4' : '3') + "6m";
            break;
        case 'white':
            col = "\x1b[" + (background? '4' : '3') + "7m";
            break;
        default:
            break;
    }

    LogCond(col + text + "\x1b[0m", condition);
}

/**
 * 
 * @param {string} message Text or object to log.
 * @param {boolean} condition Wether to log or not (default = true).
 * @param {boolean} logType console. log / warn / error / table.
 */
export function LogCond(message, condition = true, logType = 'log') {
    
    if (condition) {

        switch (logType) {
            case 'log': {
                console.log(message);
                break;
            }
            case 'warn': {
                console.warn(message);
                break;
            }
            case 'error': {
                console.error(message);
                break;
            }
            case 'table': {
                console.table(message);
                break;
            }
            default:
                break;
        }
    }
}