import { BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, PrimaryGeneratedColumn, OneToMany, OneToOne } from "typeorm";
import bcrypt from 'bcrypt';
import { Product } from "./Product.js";
import { Address } from "./Address.js";
import { Order } from "./Order.js";
import { VerificationCode } from "./VerificationCode.js";

@Entity('shops')
export class Shop extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    shop_id: string;

    @Column({ type: 'varchar', default: "https://e7.pngegg.com/pngimages/84/165/png-clipart-united-states-avatar-organization-information-user-avatar-service-computer-wallpaper-thumbnail.png" })
    avatar: string;

    @Column({ length: 255, nullable: false })
    shopName: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: false, unique: true })
    email: string;

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10)
        }
    }
    @Column({ nullable: false })
    password: string;

    @Column({ nullable: true, unique: true })
    phoneNumber: string

    @Column({ nullable: false, default: false })
    isVerified: boolean;

    @Column({ nullable: false, default: false })
    isDeleted: boolean;

    @OneToMany(() => Product, products => products.shop)
    products: Partial<Product>[]

    @OneToMany(() => Order, order => order.shop)
    orders: Partial<Order>[]

    @OneToOne(() => Address, address => address.shop)
    address: Partial<Address>

    @OneToOne(() => VerificationCode, verificationCode => verificationCode.shop, { onUpdate: 'CASCADE' })
    @JoinColumn()
    verificationCode: Partial<VerificationCode>

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}