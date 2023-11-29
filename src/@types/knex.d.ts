// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id: string
      name: string
    }
    meals: {
      id: string
      user_id: string
      title: string
      description: string
      date: string
      diet: boolean
    }
  }
}
