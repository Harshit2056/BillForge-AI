class apiError extends Error{
    constructor(
        statuscode,
        message = "something went wrong",
        stack="",
        errors = []
    ){  
        super(message)

        this.statuscode = statuscode;
        this.data = null
        this.success = false;
        this.message = message;
        this.errors = errors;
        

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor);
        }
    }
}

export {apiError}