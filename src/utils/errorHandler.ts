type HttpCode = 400 | 401 | 403 | 404 | 409 | 500;

export class AppError extends Error {
    public readonly httpCode: HttpCode;
    public readonly isOperational: boolean;

    constructor( description: string,httpCode: HttpCode, isOperational: boolean) {
        super(description);

        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain

        this.httpCode = httpCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this);
    }
}