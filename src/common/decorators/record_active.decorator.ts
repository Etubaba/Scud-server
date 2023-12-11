import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaClient } from '@prisma/client';

export function RecordIsActive(
    property: string,
    uniqueProp: string,
    validationOptions?: ValidationOptions,
) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property, uniqueProp],
            validator: RecordIsActiveConstraint,
        });
    };
}
@ValidatorConstraint({ name: 'RecordIsActive' })
export class RecordIsActiveConstraint implements ValidatorConstraintInterface {
    async validate(value: any, args: ValidationArguments) {
        const [modelName, field] = String(args.constraints[0]).split('.');
        const uniqueProp = String(args.constraints[1]);
        const queryConstraintDataBag = new Object();
        queryConstraintDataBag[field] = true;
        queryConstraintDataBag[uniqueProp] = isNaN(value)
            ? value
            : Number(value);
        const prisma = new PrismaClient();
        const recordIsActive = await prisma[modelName].findFirst({
            where: queryConstraintDataBag,
        });
        await prisma.$disconnect();

        if (recordIsActive) {
            return true;
        }
        return false;
    }

    defaultMessage(args: ValidationArguments) {
        // here you can provide default error message if validation failed
        return `the ${args.property} submitted is not currently active and cannot be used!`;
    }
}
