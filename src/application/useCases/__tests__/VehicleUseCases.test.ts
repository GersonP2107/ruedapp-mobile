import { VehicleUseCases } from '../VehicleUseCases';
import { IVehicleRepository } from '../../../domain/repositories';
import { Vehicle } from '../../../domain/entities/Vehicle';

// Mock repository
const mockVehicleRepository: jest.Mocked<IVehicleRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn()
};

describe('VehicleUseCases', () => {
  let vehicleUseCases: VehicleUseCases;

  beforeEach(() => {
    vehicleUseCases = new VehicleUseCases(mockVehicleRepository);
    jest.clearAllMocks();
  });

  describe('createVehicle', () => {
    it('should create a vehicle successfully', async () => {
      const vehicleData = {
        id: '1',
        userId: 'user1',
        vehicleTypeId: 'type1',
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
        licensePlate: 'ABC123',
        color: 'Blue',
        mileage: 50000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const expectedVehicle = new Vehicle(vehicleData);
      mockVehicleRepository.create.mockResolvedValue(expectedVehicle);

      const result = await vehicleUseCases.createVehicle(vehicleData);

      expect(mockVehicleRepository.create).toHaveBeenCalledWith(expect.any(Vehicle));
      expect(result).toEqual(expectedVehicle);
    });
  });

  describe('getVehicleById', () => {
    it('should return vehicle when found', async () => {
      const vehicleData = {
        id: '1',
        userId: 'user1',
        vehicleTypeId: 'type1',
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
        licensePlate: 'ABC123',
        color: 'Blue',
        mileage: 50000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const expectedVehicle = new Vehicle(vehicleData);
      mockVehicleRepository.findById.mockResolvedValue(expectedVehicle);

      const result = await vehicleUseCases.getVehicleById('1');

      expect(mockVehicleRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedVehicle);
    });

    it('should throw error when vehicle not found', async () => {
      mockVehicleRepository.findById.mockResolvedValue(null);

      await expect(vehicleUseCases.getVehicleById('1')).rejects.toThrow('Vehicle not found');
    });
  });

  describe('getVehiclesByUserId', () => {
    it('should return user vehicles', async () => {
      const vehicleData = {
        id: '1',
        userId: 'user1',
        vehicleTypeId: 'type1',
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
        licensePlate: 'ABC123',
        color: 'Blue',
        mileage: 50000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const expectedVehicles = [new Vehicle(vehicleData)];
      mockVehicleRepository.findByUserId.mockResolvedValue(expectedVehicles);

      const result = await vehicleUseCases.getVehiclesByUserId('user1');

      expect(mockVehicleRepository.findByUserId).toHaveBeenCalledWith('user1');
      expect(result).toEqual(expectedVehicles);
    });
  });
});