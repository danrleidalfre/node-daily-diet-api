import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary().notNullable()
    table
      .uuid('user_id')
      .unsigned()
      .index()
      .references('id')
      .inTable('users')
      .notNullable()
    table.string('title').notNullable()
    table.text('description').notNullable()
    table.dateTime('date').notNullable()
    table.boolean('diet').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
