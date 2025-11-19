import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsAdult(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAdult',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;
          const birthDate = new Date(value);
          if (isNaN(birthDate.getTime())) return false;

          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();
          if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
          }
          return age >= 18;
        },
        defaultMessage(args: ValidationArguments) {
          return 'User must be at least 18 years old';
        },
      },
    });
  };
}
