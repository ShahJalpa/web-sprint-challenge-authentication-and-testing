const request = require('supertest');
const db = require('../data/dbConfig');
const server = require('./server.js');

const Users = require('./auth/user-model');

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async ()=>{
  await db('users').truncate()
})
afterAll(async ()=>{
  await db.destroy()
})

// Write your tests here
test('sanity', () => {
  expect(true).toBe(true)
})

test('process.env.DB_ENV must be "testing"', () => {
  expect(process.env.NODE_ENV).toBe('testing')
})

describe('the API endpoints', () => {
  let user;
  beforeEach(async () => {
    user = {
      username: 'Captain Marvel',
      password: 'foobar'
    }
  })
  describe('user-model, insert', () => {
    it('creates new user in the database', async() => {
      await Users.insert(user);
      expect(await db('users')).toHaveLength(1);
      expect((await db('users'))[0]).toEqual({
        id: 1,
        username: 'Captain Marvel',
        password: 'foobar'
      })
    })
  })

  describe('[POST] /api/auth/register', () => {
    it('creates new user in the database', async() => {
      await request(server).post('/api/auth/register').send(user);
      expect(await db('users')).toHaveLength(1);
    })
    it('should return newly created user', async() => {
      const res = await request(server)
            .post('/api/auth/register')
            .send(user);
          expect(res.body.id).toEqual(1);
          expect(res.body.username).toEqual('Captain Marvel');
    })
  })

  describe('[POST] /api/auth/login', () => {
    it('should return welcome message and token', async () => {
      await request(server).post('/api/auth/register').send(user);
      const res = await request(server)
          .post('/api/auth/login')
          .send(user);
      expect(res.body.message).toBe('welcome, Captain Marvel');
      expect(res.body).toHaveProperty('token');
    })
    it('should verifies the password', async () => {
      await request(server).post('/api/auth/register').send(user);
      const someOtherUser = {
        username: 'Captain Marvel',
        password: 'something'
      }
      const res = await request(server)
          .post('/api/auth/login')
          .send(someOtherUser);

      expect(res.body).toEqual({ message: 'invalid credentials' });
    })
  })

  describe('[GET] /api/jokes', () => {
    it('should not permit the access if token is not there', async() => {
      const res = await request(server).get('/api/jokes');
      expect(res.body.message).toEqual('token required');
    })
    it('should not permit the access if token is not valid', async() => {
      const res = await request(server)
            .get('/api/jokes')
            .set('Authorization', 'notValidToken');
      expect(res.body.message).toEqual('token invalid');
    })
  })

})