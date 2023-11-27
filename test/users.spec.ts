import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should allow creating new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Test User',
      })
      .expect(201)
  })

  it('should allow listing of users', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Test User',
      })
      .expect(201)

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionResponse.body.users).toEqual([
      expect.objectContaining({
        name: 'Test User',
      }),
    ])
  })
})
