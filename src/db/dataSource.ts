import "reflect-metadata"
import { DataSource } from "typeorm";
import { User } from "./entities/User.js";
import { Shop } from "./entities/Shop.js";
import { Product } from "./entities/Product.js";
import { Order } from "./entities/Order.js";
import { Category } from "./entities/Category.js";
import { Address } from "./entities/Address.js";

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        User,
        Shop,
        Product,
        Order,
        Category,
        Address
    ],
    migrations: ['./**/migration/*.ts'],
    synchronize: true,
    logging: false,
    subscribers: []
});

export default dataSource;