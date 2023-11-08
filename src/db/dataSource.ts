import { DataSource } from "typeorm";
import { User } from "./entities/User.js";
import { Shop } from "./entities/Shop.js";
import { Product } from "./entities/Product.js";
import { Order } from "./entities/Order.js";
import { Category } from "./entities/Category.js";
import { Address } from "./entities/Address.js";
import { UserOTPVerification } from "./entities/UserOTPVerification.js";

const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.MYSQL_ADDON_HOST,
    port: Number(process.env.MYSQL_ADDON_PORT),
    username: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    entities: [
        User,
        Shop,
        Product,
        Order,
        Category,
        Address,
        UserOTPVerification
    ],
    migrations: ['./**/migration/*.ts'],
    synchronize: true,
    logging: false,
    subscribers: []
});

export default dataSource;