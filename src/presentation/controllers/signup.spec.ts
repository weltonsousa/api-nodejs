import { SignUpController } from './signup'
import { InvalidParamError, MissingParamError, ServerError } from '../errors/'
import { EmailValidator } from '../protocols';

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
  test('Should call EmailValidator with correct email', () => {
    const { sut, emailValidatorStub } = makeSute()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(true)
    const httpRequest = {
      body: {
        name: 'Nome do usuário',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    sut.handle(httpRequest)
    expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
  })
  test('Should return five hundreded if EmailValidator throws', () => {
    class EmailValidatorStub implements EmailValidator {
      isValid(): boolean {
        throw new Error()
      }
    }
    const emailValidatorStub = new EmailValidatorStub()
    const sut = new SignUpController(emailValidatorStub)
    const httpRequest = {
      body: {
        name: 'any email',
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})