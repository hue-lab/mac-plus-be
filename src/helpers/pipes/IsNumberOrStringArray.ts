import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";

@ValidatorConstraint({ name: 'string-or-number', async: false })
export class IsNumberOrStringArray implements ValidatorConstraintInterface {
  validate(arr: any, args: ValidationArguments) {
    if (!Array.isArray(arr)) return false
    const isStringsArray = arr.every(i => typeof i === "string")
    const isNumbersArray = arr.every(i => typeof i === "number")
    return isStringsArray || isNumbersArray;
  }
  defaultMessage(args: ValidationArguments) {
    return '($value) must be number[] or string[]';
  } }
