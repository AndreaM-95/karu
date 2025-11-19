import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validation decorator that checks if two properties match
 * Commonly used to validate password confirmation fields
 * 
 * @param property - Name of the property to compare against
 * @param validationOptions - Optional validation options including custom error message
 * 
 * @example
 * ```typescript
 * class ChangePasswordDto {
 *   @IsString()
 *   newPassword: string;
 * 
 *   @Match('newPassword', { message: 'Passwords do not match' })
 *   confirmPassword: string;
 * }
 * ```
 */
export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        /**
         * Validates if the current property value matches the referenced property value
         * 
         * @param value - Current property value to validate
         * @param args - Validation arguments containing constraints and object reference
         * @returns True if values match, false otherwise
         */
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
      },
    });
  };
}