
export const helpString = `
_____                                                                  
|  __ \\                                                                 
| |__) |  _ __    ___   _ __    _ __    ___     ___    ___   ___   ___  
|  ___/  | '__|  / _ \\ | '_ \\  | '__|  / _ \\   / __|  / _ \\ / __| / __| 
| |      | |    |  __/ | |_) | | |    | (_) | | (__  |  __/ \\__ \\ \\__ \\ 
|_|      |_|     \\___| | .__/  |_|     \\___/   \\___|  \\___| |___/ |___/ 
                      | |                                              
                      |_|                                              
   _____    _                        _     _                      
  |  __ \\  (_)                      | |   (_)                     
  | |  | |  _   _ __    ___    ___  | |_   _  __   __   ___   ___ 
  | |  | | | | | '__|  / _ \\  / __| | __| | | \\ \\ / /  / _ \\ / __|
  | |__| | | | | |    |  __/ | (__  | |_  | |  \\ V /  |  __/ \\__ \\
  |_____/  |_| |_|     \\___|  \\___|  \\__| |_|   \\_/    \\___| |___/
                                                                  

Commands:

 command |      parameters        |               description
╼╼╼╼╼╼╼╼╼┼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼ ┼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼
resolve  | --srcDir     (required)  |  Resolves directives in every script of a 
         | --formats              |  given source folder, and caches their
         | --log                  |  original versions.
         | --preprocessDefines    |  
╼╼╼╼╼╼╼╼╼┼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼ ┼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼
restore  | --log                  |  Restores back original scripts (with 
         |                        |  unresolved directives).
╼╼╼╼╼╼╼╼╼┼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼ ┼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼
wrap     | "command" (required)   |  Resolves scripts, executes a given command
         | --srcDir     (required)|  then restores them back.
         | --formats              |
         | --log                  |
         | --preprocessDefines    |


Arguments:

--srcDir                 Path to the source folder
                        ex: --srcDir "src"

--formats             List of file extentions for source files
                        default: ".js, .ts"
                        ex: --formats ".js, .mjs, .ts"

--log                 Enables debug logging

--preprocessDefines   Defines with which to resolve the scripts
                        ex: --formats "DEFINE1, DEFINE2"

--help                Prints command line info on this tool
`