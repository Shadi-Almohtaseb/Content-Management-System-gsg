import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { User } from "./User.js";
import { Address } from "./Address.js";
import { Shop } from "./Shop.js";
import { Product } from "./Product.js";
import { ProductVariant } from "./ProductVariants.js";

@Entity('orders')
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({
        type: "enum",
        enum: ['pending', 'shipping', 'completed', 'cancelled', 'refunded', 'failed'],
        default: 'pending'
    })
    status: 'pending' | 'shipping' | 'completed' | 'cancelled' | 'refunded' | 'failed';

    @Column({ nullable: false, type: 'float' })
    totalPrice: number

    @OneToOne(() => Address, address => address.user)
    shippingAddress: Address

    // @ManyToOne(() => Shop, shop => shop.orders)
    // shop: Partial<Shop>

    @ManyToOne(() => User, user => user.orders)
    user: Partial<User>

    // @OneToMany(() => Product, product => product.id)
    // products: Partial<Product>[]

    @OneToMany(() => ProductVariant, productVariant => productVariant.variant_id)
    variants: Partial<ProductVariant>[]

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}