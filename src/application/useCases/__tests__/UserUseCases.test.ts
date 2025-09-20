import { UserUseCases } from '../UserUseCases';
import { IUserRepository } from '../../../domain/repositories';
import { User } from '../../../domain/entities/User';

// Mock repository
const mockUserRepository: jest.Mocked<IUserRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn()
};

describe('UserUseCases', () => {
  let userUseCases: UserUseCases;

  beforeEach(() => {
    userUseCases = new UserUseCases(mockUserRepository);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const expectedUser = new User(userData);
      mockUserRepository.create.mockResolvedValue(expectedUser);

      const result = await userUseCases.createUser(userData);

      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.any(User));
      expect(result).toEqual(expectedUser);
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const existingUser = new User(userData);
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(userUseCases.createUser(userData)).rejects.toThrow('User with this email already exists');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const userData = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const expectedUser = new User(userData);
      mockUserRepository.findById.mockResolvedValue(expectedUser);

      const result = await userUseCases.getUserById('1');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedUser);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userUseCases.getUserById('1')).rejects.toThrow('User not found');
    });
  });
});