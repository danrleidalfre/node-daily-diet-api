import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { isValid, z } from 'zod'
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

      const meals = await knex('meals').where('user_id', user.id).select()

      return { meals }
    },
  )

  app.post(
    '/',
    {
      preHandler: [checkSessionId],
    },
    async (request, reply) => {
      const createUserBodySchema = z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        diet: z.boolean(),
      })

      const { title, description, date, diet } = createUserBodySchema.parse(
        request.body,
      )
      const sessionId = request.cookies.sessionId
      const user = await knex('users').where('session_id', sessionId).first()

      if (isNaN(new Date(date).getTime())) {
        return reply.status(422).send({
          error: 'Field date is required in this format: yyyy-mm-dd hh:mm:ss',
        })
      }

      await knex('meals').insert({
        id: randomUUID(),
        user_id: user.id,
        title,
        description,
        date,
        diet,
      })

      return reply.status(201).send()
    },
  )
}
