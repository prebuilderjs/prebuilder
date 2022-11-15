
export class MyClass {

    //#if !MY_DIRECTIVE
        MyFunction = () => {
            console.log("Hello");
        }
    //#else
    //#post-code MyFunction = () => {
    //#post-code     console.log("Hello, processed with MY_DIRECTIVE");
    //#post-code }
    //#endif
    
    }