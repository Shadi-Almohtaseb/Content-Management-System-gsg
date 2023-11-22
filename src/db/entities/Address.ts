import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import { User } from "./User.js";
import { Shop } from "./Shop.js";

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

    @Column({ length: 255, nullable: true })
    region: string;

    @OneToOne(() => User, user => user.address)
    user: Partial<User>

    @OneToOne(() => Shop, shop => shop.address)
    shop: Partial<Shop>

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}