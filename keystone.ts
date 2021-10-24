import { config, createSchema } from "@keystone-next/keystone/schema";
import { createAuth } from "@keystone-next/auth";
import { User } from "./schemas/User";
import { Product } from "./schemas/Product";
import { ProductImage } from "./schemas/ProductImage";
import {
  withItemData,
  statelessSessions,
} from "@keystone-next/keystone/session";
import "dotenv/config";
import { insertSeedData } from "./seed-data";

const databaseURL = process.env.DATABASE_URL;

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360,
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  initFirstItem: {
    fields: ["name", "email", "password"],
  },
});

export default withAuth(
  config({
    // @ts-ignore
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: "mongoose",
      url: databaseURL, //"mongodb://localhost:27017/sick-fits-keystone",
      onConnect: async (keystone) => {
        console.log("Connected to Database");
        if (process.argv.includes("--seed-data")) {
          await insertSeedData(keystone);
        }
      },
    },

    lists: createSchema({
      User,
      Product,
      ProductImage,
    }),

    ui: {
      isAccessAllowed: ({ session }) => {
        console.log(session);
        return !!session?.data;
      },
    },

    session: withItemData(statelessSessions(sessionConfig), {
      User: `id`,
    }),
  })
);
