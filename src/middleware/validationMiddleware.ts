import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Request, Response, NextFunction } from 'express';

export const validationMiddleware = (type: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const object = plainToClass(type, req.body);
        const errors: ValidationError[] = await validate(object);

        if (errors.length > 0) {
            // Create a structured error response
            const formattedErrors = errors.reduce((acc, error) => {
                if (error.constraints) {
                    acc[error.property] = Object.values(error.constraints);
                }
                return acc;
            }, {} as Record<string, string[]>);

            return res.status(400).json({
                message: 'Validation failed',
                errors: formattedErrors,
            });
        }

        next();
    };
};
