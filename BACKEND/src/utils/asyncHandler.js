const asyncHandler = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            const statusCode = error.statuscode || error.statusCode || error.status || 500;
            if (statusCode >= 500) {
                console.error("Server Error:", error.message);
            }

            return res
                .status(statusCode)
                .json({
                    success: false,
                    message: error.message || "Something went wrong",
                    errors: error.errors || []
                });
        }
    };
};

export { asyncHandler };