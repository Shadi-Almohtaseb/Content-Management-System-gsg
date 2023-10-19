import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./User.js";
import { Address } from "./Address.js";

@Entity('orders')
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: string;

    @Column({ length: 255, nullable: false })
    name: string

    @Column({
        type: "enum",
        enum: ['pending', 'shipping', 'completed', 'cancelled', 'refunded', 'failed'],
        default: 'pending'
    })
    status: 'pending' | 'shipping' | 'completed' | 'cancelled' | 'refunded' | 'failed';

    @Column({ nullable: true })
    totalPrice: number

    @ManyToOne(() => User, user => user.orders)
    user: User

    @Column({ nullable: false })
    shippingAddress: Address

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}