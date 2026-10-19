import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: text("description").default("").notNull(),
  image: text("image").default("").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  description: text("description").default("").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  oldPrice: numeric("old_price", { precision: 12, scale: 2 }),
  stock: integer("stock").default(0).notNull(),
  images: jsonb("images").$type<string[]>().default([]).notNull(),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  featured: boolean("featured").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("4.5").notNull(),
  sold: integer("sold").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const wilayas = pgTable("wilayas", {
  id: serial("id").primaryKey(),
  code: integer("code").notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  homeFee: integer("home_fee").default(600).notNull(),
  deskFee: integer("desk_fee").default(400).notNull(),
  active: boolean("active").default(true).notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 32 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  wilayaCode: integer("wilaya_code").notNull(),
  wilayaName: varchar("wilaya_name", { length: 120 }).notNull(),
  commune: varchar("commune", { length: 180 }).default("").notNull(),
  address: text("address").default("").notNull(),
  deliveryType: varchar("delivery_type", { length: 20 }).default("home").notNull(),
  subtotal: integer("subtotal").notNull(),
  shippingFee: integer("shipping_fee").notNull(),
  total: integer("total").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  notes: text("notes").default("").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  productName: varchar("product_name", { length: 220 }).notNull(),
  image: text("image").default("").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
});

export const settings = pgTable("settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: text("value").default("").notNull(),
});

export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Wilaya = typeof wilayas.$inferSelect;
