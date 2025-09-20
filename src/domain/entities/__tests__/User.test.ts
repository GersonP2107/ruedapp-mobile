import { User } from '../User';

describe('User Entity', () => {
  it('should create a user with valid data', () => {
    const userData = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      phone: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const user = new User(userData);

    expect(user.id).toBe(userData.id);
    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
    expect(user.phone).toBe(userData.phone);
  });

  it('should validate email format', () => {
    const userData = {
      id: '1',
      email: 'invalid-email',
      name: 'Test User',
      phone: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => new User(userData)).toThrow('Invalid email format');
  });

  it('should validate phone format', () => {
    const userData = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      phone: 'invalid-phone',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => new User(userData)).toThrow('Invalid phone format');
  });
});