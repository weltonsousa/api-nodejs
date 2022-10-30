import { SignUpController } from './signup'
import { InvalidParamError, MissingParamError, ServerError } from '../errors/'
import { EmailValidator } from '../protocols';
import { AddAccount, AddAccountModel } from '../../domain/usecases/add-account';
import { AccountModel } from '../../domain/models/account';

interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
  addAccountStub: AddAccount
}

//factory
const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}
const makeEmailValidatorWithError = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      throw new Error()
    }
  }
  return new EmailValidatorStub()
}

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    add(account: AddAccountModel): AccountModel {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
      return fakeAccount
    }
  }
  return new AddAccountStub()
}

//--- factory -----

const makeSute = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator()
  const addAccountStub = makeAddAccount()
  const sut = new SignUpController(emailValidatorStub, addAccountStub);
  return {
    sut,
    emailValidatorStub,
    addAccountStub
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
    const emailValidatorStub = makeEmailValidatorWithError()
    const addAccount = makeAddAccount()
    const sut = new SignUpController(emailValidatorStub, addAccount)
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
  test('Should return 400 if password confirmation fails', () => {
    const { sut } = makeSute()
    const httpRequest = {
      body: {
        name: 'welton',
        email: 'email@maila',
        passowrd: '123',
        passwordConfirmation: '123'
      }
    }
  })
  test('should call AddAccount with correct values', () => {
    const { sut, addAccountStub } = makeSute();
    const addSpy = jest.spyOn(addAccountStub, 'add')
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passowrdConfirmation: 'any_password'
      }
    }
    sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })
})