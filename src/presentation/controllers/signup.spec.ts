import { SignUpController } from './signup'
import { MissingParamError } from '../errors/missing-param-error'
import { InvalidParamError } from '../errors/invalid-param-error';
import { EmailValidator } from '../protocols/email-validator';

interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
}

//criacao de um factory
const makeSute = (): SutTypes => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true
    }
  }
  const emailValidatorStub = new EmailValidatorStub()
  const sut = new SignUpController(emailValidatorStub);

  return {
    sut,
    emailValidatorStub
  }
}

describe('Signup Controller', () => {
  test('Should return four hundred if no name is provider', () => {
    const { sut } = makeSute()
    const httpRequest = {
      body: {
        //name: 'nome do usuario',
        // email: 'any_email@mail.com',
        password: 'any_password',
        //  passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })
  test('Should return four hundred if no email is provider', () => {
    const { sut } = makeSute()
    const httpRequest = {
      body: {
        //name: 'Nome do usuário',
        //email: 'any_email@mail.com',
        password: 'any_password',
        // passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })
  test('Should return four hundred if an invalid email is provider', () => {
    const { sut, emailValidatorStub } = makeSute()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(true)
    const httpRequest = {
      body: {
        name: 'Nome do usuário',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })
})