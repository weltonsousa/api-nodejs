export class InvalidParamError extends Error {
  constructor(paramName: string) {
    super(`Ivalid Email Error {paramName}`);
    this.name = 'InvalidParamError'
  }
}