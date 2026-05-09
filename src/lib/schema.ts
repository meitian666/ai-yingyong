import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  emailVerified: integer('email_verified').notNull().default(0),
  verificationToken: text('verification_token'),
  tokenExpiresAt: text('token_expires_at'),
});
