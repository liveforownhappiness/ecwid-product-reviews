import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

config({ path: '.env.local' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  ...(process.env['DATABASE_URL'] && {
    datasource: { url: process.env['DATABASE_URL'] },
  }),
})
