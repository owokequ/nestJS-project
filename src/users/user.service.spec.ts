import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';

const mockUserRepository = () => ({
  verifyDataFromDB: jest.fn(),
  addUserFromDB: jest.fn(),
  updateTokenFromData: jest.fn(),
});

const mockConfigService = () => ({
  get: jest.fn(),
});

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
    const dto = {
      email: 'testing@example.com',
      name: 'Test',
      password: 'pass',
    };
    it('should throw BadRequestException if user exists', async () => {
      userRepository.verifyDataFromDB.mockResolvedValue(true);

      await expect(service.userRegister(dto)).rejects.toThrow(
        'Пользователь уже зарегестрирован',
      );

      expect(userRepository.verifyDataFromDB).toHaveBeenCalledWith(dto.email);
    });
  });
});
