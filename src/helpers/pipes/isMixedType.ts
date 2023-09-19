import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";

const enum DATA_TYPE{
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean'
}

@ValidatorConstraint({ name: 'string-stringArray-number-boolean', async: false })
export class IsMixedType implements ValidatorConstraintInterface {
  validate(data: any, args: ValidationArguments) {
    if (Array.isArray(data)) {
      return data.every(i => typeof i === DATA_TYPE.STRING)
    }
    return typeof data === DATA_TYPE.STRING ||
      typeof data === DATA_TYPE.NUMBER ||
      typeof data === DATA_TYPE.BOOLEAN
  }
  defaultMessage(args: ValidationArguments) {
    return '($value) must be string or string[] or number or boolean';
  } }
