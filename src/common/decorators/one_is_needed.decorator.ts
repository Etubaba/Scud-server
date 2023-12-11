import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
export function OneIsNeeded(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: OneIsNeededConstraint,
        });
    };
}
@ValidatorConstraint({ name: 'OneIsNeeded' })
export class OneIsNeededConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];
        return isNotNullOrEmpty(value) || isNotNullOrEmpty(relatedValue);
    }

    defaultMessage(args: ValidationArguments) {
        // here you can provide default error message if validation failed
        return `one of ${args.property} or ${args.constraints}  must exist!`;
    }
}

export const isNotNullOrEmpty = (param: any): boolean => {
    return param !== null && param !== undefined && <string>param !== '';
};
