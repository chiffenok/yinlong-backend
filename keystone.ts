import { config, list } from '@keystone-6/core';
import 'dotenv/config';
import { allowAll } from '@keystone-6/core/access';
import {
  text,
  relationship,
  timestamp,
  select,
  password,
} from '@keystone-6/core/fields';
import { session, withAuth } from './auth';

const DB_URL =
  process.env.DB_URL || 'postgres://ann:@localhost:5432/yinlong_db';
console.log(DB_URL);
const lists = {
  User: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
      }),
      recipes: relationship({ ref: 'Recipe.author', many: true }),
      password: password({ validation: { isRequired: true } }),
    },
  }),
  Recipe: list({
    access: allowAll,
    fields: {
      title: text(),
      publishAt: timestamp(),
      author: relationship({
        ref: 'User.recipes',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineCreate: { fields: ['name', 'email'] },
        },
      }),
      status: select({
        options: [
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
        ],
        defaultValue: 'draft',
        ui: { displayMode: 'segmented-control' },
      }),
    },
  }),
};

export default config(
  withAuth({
    db: {
      provider: 'postgresql',
      url: DB_URL,
      onConnect: async (context) => {
        console.log('Connected to DB');
      },
      enableLogging: true,
      idField: { kind: 'uuid' },
    },
    lists,
    session,
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
    },
  })
);
