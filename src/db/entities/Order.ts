import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, OneToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { User } from "./User.js";
import { Address } from "./Address.js";
import { Shop } from "./Shop.js";
import { ProductVariant } from "./ProductVariants.js";

@Entity('orders')
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ length: 255, nullable: false })
    fullName: string;

    @Column({ length: 255, nullable: false })
    phoneNumber: string;

    @Column({
        type: "enum",
        enum: ['pending', 'shipping', 'completed', 'cancelled', 'refunded', 'failed'],
        default: 'pending'
    })
    status: 'pending' | 'shipping' | 'completed' | 'cancelled' | 'refunded' | 'failed';

    @Column({ nullable: false, type: 'float' })
    quantity: number

    @Column({ nullable: false, type: 'float' })
    totalPrice: number

    @ManyToOne(() => Address, address => address.orders, { cascade: true })
    shippingAddress: Address

    @ManyToOne(() => Shop, shop => shop.orders)
    shop: Partial<Shop>

    @ManyToOne(() => User, user => user.orders)
    user: Partial<User>

    @ManyToMany(() => ProductVariant, productVariant => productVariant.orders)
    @JoinTable()
    variants: Partial<ProductVariant>[]

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}