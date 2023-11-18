import { DataSource } from "typeorm";
import { User } from "./entities/User.js";
import { Shop } from "./entities/Shop.js";
import { Product } from "./entities/Product.js";
import { Order } from "./entities/Order.js";
import { Category } from "./entities/Category.js";
import { Address } from "./entities/Address.js";
import { VerificationCode } from "./entities/VerificationCode.js";
import { Tag } from "./entities/Tag.js";
import { Color } from "./entities/Color.js";
import { Size } from "./entities/Size.js";

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
        Tag,
        Address,
        Color,
        Size,
        VerificationCode
    ],
    migrations: ['./**/migration/*.ts'],
    synchronize: true,
    logging: false,
    subscribers: []
});

export default dataSource;