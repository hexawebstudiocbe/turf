require('./setup');
const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');

describe('Authentication & RBAC Tests', () => {
  it('should register a new customer successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      password: 'Password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('john@example.com');
    expect(res.body.data.user.role).toBe('CUSTOMER');
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      password: 'Password123',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'John Second',
      email: 'john@example.com',
      phone: '9876543211',
      password: 'Password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login with correct credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      password: 'Password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'Password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      password: 'Password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'WrongPassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should prevent standard customer from accessing admin dashboard', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Customer',
      email: 'cust@example.com',
      phone: '9876543210',
      password: 'Password123',
    });

    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
