import { defineConfig } from '@prisma/config'
import 'dotenv/config'

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: process.env.DATABASE_URL,
    // @ts-expect-error - directUrl is supported by the engine but missing in current v7 types
    directUrl: process.env.DIRECT_URL,
  },
})
