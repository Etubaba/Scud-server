import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { parsePhoneNumber } from 'libphonenumber-js';

export function IsInternationalFormat(validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsInternationalFormatConstraint,
        });
    };
}
@ValidatorConstraint({ name: 'IsInternationalFormat' })
export class IsInternationalFormatConstraint
    implements ValidatorConstraintInterface
{
    async validate(phoneNumber: any, args: ValidationArguments) {
        let validatedPhoneNumber = parsePhoneNumber(phoneNumber, 'NG');
        if (validatedPhoneNumber.number !== phoneNumber) {
            return false;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        // here you can provide default error message if validation failed
        return `${args.property} format incorrect. Please use international format!`;
    }
}
