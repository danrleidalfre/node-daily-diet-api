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

      const { id } = userBodySchema.parse(user)

      if (isNaN(new Date(date).getTime())) {
        return reply.status(422).send({
          error: 'Field date is required in this format: yyyy-mm-dd hh:mm:ss',
        })
      }

      await knex('meals').insert({
        id: randomUUID(),
        user_id: id,
        title,
        description,
        date,
        diet,
      })

      return reply.status(201).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionId],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id: mealId } = getMealParamsSchema.parse(request.params)

      const updateMealParamsSchema = z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        diet: z.boolean(),
      })

      const { title, description, date, diet } = updateMealParamsSchema.parse(
        request.body,
      )

      await knex('meals')
        .update({
          title,
          description,
          date,
          diet,
        })
        .where('id', mealId)

      return reply.status(201).send()
    },
  )
}
