
export function MyFunction() {

    #if MY_DIRECTIVE
        MySubFunction = () => {
            console.log("Hello, processed with MY_DIRECTIVE");
        }
    #else
        MySubFunction = () => {
            console.log("Hello");
        }
    #endif
    
    }