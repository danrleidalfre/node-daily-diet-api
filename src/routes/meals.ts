import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { checkSessionId } from '../middlewares/check-session-id'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const user = await knex('users').where('session_id', sessionId).first()

      const userBodySchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = userBodySchema.parse(user)

      const meals = await knex('meals').where('user_id', id).select()

      return { meals }
    },
  )

  app.get('/:id', { preHandler: [checkSessionId] }, async (request, reply) => {
    const { id: mealId } = z
      .object({ id: z.string().uuid() })
      .parse(request.params)

    const sessionId = request.cookies.sessionId
    const user = await knex('users').where('session_id', sessionId).first()

    const userBodySchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = userBodySchema.parse(user)

    const meal = await knex('meals').where('id', mealId).first()

    if (!meal || meal.user_id !== id) {
      return reply.status(404).send({ error: 'Meal not found or unauthorized' })
    }

    return reply.status(200).send({ meal })
  })

  app.post(
    '/',
    {
      preHandler: [checkSessionId],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        diet: z.boolean(),
      })

      const { title, description, date, diet } = createMealBodySchema.parse(
        request.body,
      )
      const sessionId = request.cookies.sessionId
      const user = await knex('users').where('session_id', sessionId).first()
      const userBodySchema = z.object({
        id: z.string().uuid(),
      })

      const { id: userId } = userBodySchema.parse(user)

      if (isNaN(new Date(date).getTime())) {
        return reply.status(422).send({
          error: 'Field date is required in this format: yyyy-mm-dd hh:mm:ss',
        })
      }

      await knex('meals').insert({
        id: randomUUID(),
        user_id: userId,
        title,
        description,
        date,
        diet,
      })

      return reply.status(201).send()
    },
  )

  app.put('/:id', { preHandler: [checkSessionId] }, async (request, reply) => {
    const { id: mealId } = z
      .object({ id: z.string().uuid() })
      .parse(request.params)

    const { title, description, date, diet } = z
      .object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        diet: z.boolean(),
      })
      .parse(request.body)

    await knex('meals')
      .update({ title, description, date, diet })
      .where('id', mealId)

    return reply.status(201).send()
  })

  app.delete(
    '/:id',
    { preHandler: [checkSessionId] },
    async (request, reply) => {
      const { id: mealId } = z
        .object({ id: z.string().uuid() })
        .parse(request.params)

      const sessionId = request.cookies.sessionId
      const user = await knex('users').where('session_id', sessionId).first()

      const userBodySchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = userBodySchema.parse(user)

      const meal = await knex('meals').where('id', mealId).first()

      if (!meal || meal.user_id !== id) {
        return reply
          .status(404)
          .send({ error: 'Meal not found or unauthorized' })
      }

      await knex('meals').where('id', mealId).del()

      return reply.status(204).send()
    },
  )

  app.get(
    '/total',
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const user = await knex('users').where('session_id', sessionId).first()

      const userBodySchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = userBodySchema.parse(user)

      return knex('meals').where('user_id', id).count('id as total').first()
    },
  )

  app.get(
    '/in-diet',
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const user = await knex('users').where('session_id', sessionId).first()

      const userBodySchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = userBodySchema.parse(user)

      return knex('meals')
        .where('user_id', id)
        .where('diet', true)
        .count('id as in_diet')
        .first()
    },
  )

  app.get(
    '/out-diet',
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const user = await knex('users').where('session_id', sessionId).first()

      const userBodySchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = userBodySchema.parse(user)

      return knex('meals')
        .where('user_id', id)
        .where('diet', false)
        .count('id as out_diet')
        .first()
    },
  )
}
