import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';

const mockUserRepository = () => ({
  verifyDataFromDB: jest.fn(),
  addUserFromDB: jest.fn(),
  updateTokenFromDB: jest.fn(),
});

const mockConfigService = () => ({
  get: jest.fn(),
});

const dto = {
  email: 'testing@example.com',
  name: 'Test',
  password: 'pass',
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: ReturnType<typeof mockUserRepository>;
  //   let configService: ReturnType<typeof mockConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: ConfigService, useFactory: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(UserRepository);
    // configService = module.get(ConfigService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('UserRegister', () => {
    it('should throw BadRequestException if user exists', async () => {
      userRepository.verifyDataFromDB.mockResolvedValue(true);

      await expect(service.userRegister(dto)).rejects.toThrow(
        'Пользователь уже зарегестрирован',
      );

      expect(userRepository.verifyDataFromDB).toHaveBeenCalledWith(dto.email);
    });

    it('should be return BadRequestException', async () => {
      userRepository.verifyDataFromDB.mockResolvedValue({
        id: 1,
        email: dto.email,
        name: dto.name,
        password: 'hashedPass',
        role: 'user',
      });
      jest.spyOn(User.prototype, 'comparePassword').mockResolvedValue(false);
      await expect(service.userLogin(dto)).rejects.toThrow(
        'password is not correct',
      );
    });

    it('should return UserLogin', async () => {
      userRepository.verifyDataFromDB.mockResolvedValue({
        id: 1,
        email: dto.email,
        name: dto.name,
        password: 'hashedPass',
        role: 'user',
      });
      jest.spyOn(User.prototype, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(UsersService.prototype, 'createToken').mockReturnValue({
        refreshToken: 'fake-refresh',
        accessToken: 'fake-access',
      });
      userRepository.updateTokenFromDB.mockResolvedValue({
        id: 1,
        created_at: '09/11/2025',
        user_id: 1,
        refresh_token: 'fake-refresh',
      });

      await expect(service.userLogin(dto)).resolves.toEqual({
        refresh: 'fake-refresh',
        access: 'fake-access',
        role: 'user',
      });
    });
  });
  describe('UserLogin', () => {
    it('should throw NotFoundException if user not exists', async () => {
      userRepository.verifyDataFromDB.mockResolvedValue(false);
      await expect(
        service.userLogin({ email: dto.email, password: dto.password }),
      ).rejects.toThrow('user not found');
    });

    it('should throw BadRequestException if user password not compare', async () => {
      userRepository.verifyDataFromDB.mockResolvedValue({
        id: 1,
        email: dto.email,
        name: dto.name,
        password: 'hashedPass',
        role: 'user',
      });
      jest.spyOn(User.prototype, 'comparePassword').mockResolvedValue(false);
      await expect(service.userLogin(dto)).rejects.toThrow(
        'password is not correct',
      );
    });

    it('should return UserLogin', async () => {
      userRepository.verifyDataFromDB.mockResolvedValue({
        id: 1,
        email: dto.email,
        name: dto.name,
        password: 'hashedPass',
        role: 'user',
      });
      jest.spyOn(User.prototype, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(UsersService.prototype, 'createToken').mockReturnValue({
        accessToken: 'fake-access',
        refreshToken: 'fake-refresh',
      });

      userRepository.updateTokenFromDB.mockResolvedValue({
        id: 1,
        created_at: '09/11/2025',
        user_id: 1,
        refresh_token: 'fake-refresh',
      });
      await expect(service.userLogin(dto)).resolves.toEqual({
        refresh: 'fake-refresh',
        access: 'fake-access',
        role: 'user',
      });
    });
  });
});
