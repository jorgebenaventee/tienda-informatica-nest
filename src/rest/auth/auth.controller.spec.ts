import { AuthController } from './auth.controller'
import { TestBed } from '@automock/jest'
import { AuthService } from './auth.service'
import { createClientDto } from '../clients/mocks'

describe('AuthController', () => {
  let controller: AuthController
  let authService: jest.Mocked<AuthService>

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.create(AuthController).compile()

    controller = unit
    authService = unitRef.get(AuthService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('signIn', () => {
    it('should return access token', async () => {
      authService.signIn.mockResolvedValue({ accessToken: 'token' })
      const result = await controller.signIn(createClientDto)
      expect(result).toHaveProperty('accessToken')
    })

    it('should throw if user invalid', async () => {
      authService.signIn.mockRejectedValue(new Error())
      await expect(() => controller.signIn(createClientDto)).rejects.toThrow()
    })

    it('should throw if password invalid', async () => {
      authService.signIn.mockRejectedValue(new Error())
      await expect(() => controller.signIn(createClientDto)).rejects.toThrow()
    })
  })

  describe('signUp', () => {
    it('should return access token', async () => {
      authService.signUp.mockResolvedValue({ accessToken: 'token' })
      const result = await controller.signUp(createClientDto)
      expect(result).toHaveProperty('accessToken')
    })
  })

  describe('getProfile', () => {
    it('should return user', async () => {
      authService.getProfile.mockResolvedValue(createClientDto as any)
      const result = await controller.getProfile({} as any)
      expect(result).toEqual(createClientDto)
    })
  })
})
