/// <reference path="../../../jest.d.ts" />
import request from 'supertest';
import app from '../../app';

describe('Services Integration Tests', () => {
  describe('GET /api/services', () => {
    test('should get all services', async () => {
      const response = await request(app)
        .get('/api/services');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/services/:id', () => {
    test('should get service by ID', async () => {
      // First get all services to get a valid ID
      const servicesResponse = await request(app)
        .get('/api/services');
      
      if (servicesResponse.body.data && servicesResponse.body.data.length > 0) {
        const serviceId = servicesResponse.body.data[0]._id || servicesResponse.body.data[0].id;
        const response = await request(app)
          .get(`/api/services/${serviceId}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('service');
      }
    });

    test('should return error for invalid service ID', async () => {
      const response = await request(app)
        .get('/api/services/invalid-id-123');
      
      // Could be 404 or 400 depending on implementation
      expect([400, 404]).toContain(response.status);
    });
  });

  describe('GET /api/services/:id/providers', () => {
    test('should get available providers', async () => {
      // First get all services to get a valid ID
      const servicesResponse = await request(app)
        .get('/api/services');
      
      if (servicesResponse.body.data && servicesResponse.body.data.length > 0) {
        const serviceId = servicesResponse.body.data[0]._id || servicesResponse.body.data[0].id;
        const response = await request(app)
          .get(`/api/services/${serviceId}/providers`)
          .query({ date: '2024-12-25', area: 'Thamel' });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('providers');
        expect(Array.isArray(response.body.providers)).toBe(true);
      }
    });

    test('should return error without date parameter', async () => {
      const servicesResponse = await request(app)
        .get('/api/services');
      
      if (servicesResponse.body.data && servicesResponse.body.data.length > 0) {
        const serviceId = servicesResponse.body.data[0]._id || servicesResponse.body.data[0].id;
        const response = await request(app)
          .get(`/api/services/${serviceId}/providers`)
          .query({ area: 'Thamel' });
        
        expect(response.status).toBe(400);
      }
    });
  });

  describe('GET /api/service-categories', () => {
    test('should get service categories', async () => {
      const response = await request(app)
        .get('/api/service-categories');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
    });
  });
});
