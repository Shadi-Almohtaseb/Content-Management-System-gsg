import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User.js";
import { Order } from "./Order.js";

@Entity('addresses')
export class Address extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ length: 255, nullable: false })
    country: string;

    @Column({ length: 255, nullable: false })
    city: string;

    @Column({ length: 255, nullable: false })
    street: string;

    @Column({ length: 255, nullable: false })
    region: string;

    @OneToMany(() => User, user => user.address)
    @JoinColumn()
    user: Partial<User>

    @OneToMany(() => Order, orders => orders.shippingAddress)
    orders: Partial<Order[]>;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}