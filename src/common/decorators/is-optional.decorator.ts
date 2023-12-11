import { ValidationOptions, ValidateIf } from 'class-validator';

export function IsNotOptionalIf(
    allowOptional: (obj: any, value: any) => boolean,
    options?: ValidationOptions,
) {
    return ValidateIf((obj, value) => allowOptional(obj, value), options);
}
