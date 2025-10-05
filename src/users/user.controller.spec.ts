import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { emit } from 'process';
import { access } from 'fs';
import { Response } from 'express';

const mockUserService = () => ({
  userRegister: jest.fn(),
  userLogin: jest.fn(),
  createToken: jest.fn(),
  refreshToken: jest.fn(),
});

const dto = {
  name: 'Liza',
  email: 'test@test.com',
  password: '123',
};

const resultDto = {
  id: 1,
  email: dto.email,
  name: dto.name,
  password: 'hashedPass',
  role: 'user',
};

const mockRes = () => {
  const res: Response = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (body = {}, cookies = {}, user = {}) => ({
  body,
  cookies,
  user,
});

const mockNext = jest.fn();

describe('UserController', () => {
  let controller: UsersController;
  let userService: ReturnType<typeof mockUserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useFactory: mockUserService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);
  });

  it('should be register user', async () => {
    const res = mockRes(); // фейковый res
    const req = mockReq({ email: 'test@test.com', password: '123' }); // фейковый req
    const next = mockNext; // фейковый next

    userService.userRegister.mockResolvedValue({
      refreshToken: 'fake-refresh',
      accessToken: 'fake-access',
      data: { id: 1, name: 'Test', email: 'test@test.com' },
    });

    await controller.AddUser(req.body, res, next);

    expect(userService.userRegister).toHaveBeenCalledWith(req.body); // проверили, что сервис вызвался
    expect(res.status).toHaveBeenCalledWith(201); // проверили статус
    expect(res.json).toHaveBeenCalledWith({
      user: { id: 1, name: 'Test', email: 'test@test.com' },
      accessToken: 'fake-access',
    });
  });

  it('should be LoginUser', async () => {
    const res = mockRes(); // фейковый res
    const req = mockReq({ email: 'test@test.com', password: '123' }); // фейковый req
    const next = mockNext; // фейковый next

    userService.userLogin.mockResolvedValue({
      refresh: 'fake-refresh',
      access: 'fake-access',
    });
    await controller.LoginUser(
      { email: dto.email, password: dto.password },
      res,
      next,
    );

    expect(userService.userLogin).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({
      message: true,
      access: 'fake-access',
    });
  });
});
