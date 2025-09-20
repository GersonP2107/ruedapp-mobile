import { Vehicle } from '../Vehicle';

describe('Vehicle Entity', () => {
  it('should create a vehicle with valid data', () => {
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

    const vehicle = new Vehicle(vehicleData);

    expect(vehicle.id).toBe(vehicleData.id);
    expect(vehicle.brand).toBe(vehicleData.brand);
    expect(vehicle.model).toBe(vehicleData.model);
    expect(vehicle.year).toBe(vehicleData.year);
    expect(vehicle.licensePlate).toBe(vehicleData.licensePlate);
  });

  it('should validate year is not in the future', () => {
    const vehicleData = {
      id: '1',
      userId: 'user1',
      vehicleTypeId: 'type1',
      brand: 'Toyota',
      model: 'Camry',
      year: new Date().getFullYear() + 2,
      licensePlate: 'ABC123',
      color: 'Blue',
      mileage: 50000,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => new Vehicle(vehicleData)).toThrow('Year cannot be in the future');
  });

  it('should validate license plate format', () => {
    const vehicleData = {
      id: '1',
      userId: 'user1',
      vehicleTypeId: 'type1',
      brand: 'Toyota',
      model: 'Camry',
      year: 2020,
      licensePlate: '',
      color: 'Blue',
      mileage: 50000,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => new Vehicle(vehicleData)).toThrow('License plate is required');
  });
});