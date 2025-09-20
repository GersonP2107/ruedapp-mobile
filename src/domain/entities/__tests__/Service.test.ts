import { Service } from '../Service';

describe('Service Entity', () => {
  it('should create a service with valid data', () => {
    const serviceData = {
      id: '1',
      vehicleId: 'vehicle1',
      serviceTypeId: 'type1',
      description: 'Oil change',
      cost: 50.00,
      serviceDate: new Date(),
      mileage: 60000,
      notes: 'Regular maintenance',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const service = new Service(serviceData);

    expect(service.id).toBe(serviceData.id);
    expect(service.vehicleId).toBe(serviceData.vehicleId);
    expect(service.description).toBe(serviceData.description);
    expect(service.cost).toBe(serviceData.cost);
    expect(service.mileage).toBe(serviceData.mileage);
  });

  it('should validate description is not empty', () => {
    const serviceData = {
      id: '1',
      vehicleId: 'vehicle1',
      serviceTypeId: 'type1',
      description: '',
      cost: 50.00,
      serviceDate: new Date(),
      mileage: 60000,
      notes: 'Regular maintenance',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => new Service(serviceData)).toThrow('Description cannot be empty');
  });

  it('should validate cost is positive', () => {
    const serviceData = {
      id: '1',
      vehicleId: 'vehicle1',
      serviceTypeId: 'type1',
      description: 'Oil change',
      cost: -10.00,
      serviceDate: new Date(),
      mileage: 60000,
      notes: 'Regular maintenance',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => new Service(serviceData)).toThrow('Cost must be positive');
  });
});