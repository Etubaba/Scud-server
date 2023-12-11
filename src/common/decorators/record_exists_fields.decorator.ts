import { PrismaClient } from '@prisma/client';
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

export function RecordExistsFields(
    properties: string[],
    validationOptions?: ValidationOptions,
) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: properties,
            validator: RecordExistsFieldsConstraint,
        });
    };
}

@ValidatorConstraint({ name: 'RecordExistsFields' })
export class RecordExistsFieldsConstraint
    implements ValidatorConstraintInterface
{
    async validate(value: any, args?: ValidationArguments) {
        if (!value) return false;
        const [first, ...rest] = args.constraints;
        const [modelName, field] = String(first).split('.');
        const queryConstraintDataBag = new Object();
        queryConstraintDataBag[field] = value;
        for (const idx in rest) {
            const constraint = rest[idx];
            queryConstraintDataBag[constraint] = (args.object as any)[
                constraint
            ];
        }
        const prisma = new PrismaClient();
        const record = await prisma[modelName].findFirst({
            where: queryConstraintDataBag,
        });
        await prisma.$disconnect();

        if (record) {
            return false;
        }
        return true;
    }

    defaultMessage(args?: ValidationArguments): string {
        return `${args.property} already exists!`;
    }
}
