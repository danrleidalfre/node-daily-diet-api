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
      date: string
      diet: boolean
    }
  }
}
