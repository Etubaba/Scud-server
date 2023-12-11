import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
export function IsSameLength(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: SameLengthConstraint,
        });
    };
}
@ValidatorConstraint({ name: 'IsSameLength' })
export class SameLengthConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];
        if (!relatedValue || !value) return false;
        return value.length === relatedValue.length;
    }

    defaultMessage(args: ValidationArguments) {
        // here you can provide default error message if validation failed
        return `${args.property} and ${args.constraints} fields must have same length`;
    }
}
