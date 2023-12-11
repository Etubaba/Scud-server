import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
export function IsLess(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsLessConstraint,
        });
    };
}
@ValidatorConstraint({ name: 'IsLess' })
export class IsLessConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];
        const numberValue = parseInt(value);
        const relatedNumberValue = parseInt(relatedValue);
        if (isNaN(numberValue) || isNaN(relatedNumberValue)) {
            return false;
        }
        return numberValue < relatedNumberValue;
    }

    defaultMessage(args: ValidationArguments) {
        // here you can provide default error message if validation failed
        return `${args.property} must be less than ${args.constraints}`;
    }
}
