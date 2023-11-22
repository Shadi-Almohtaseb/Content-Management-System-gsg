import { BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from "typeorm";
import bcrypt from 'bcrypt';
import { Order } from "./Order.js";
import { Address } from "./Address.js";
import { VerificationCode } from "./VerificationCode.js";

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', default: "https://e7.pngegg.com/pngimages/84/165/png-clipart-united-states-avatar-organization-information-user-avatar-service-computer-wallpaper-thumbnail.png" })
    avatar: string;

    @Column({ length: 255, nullable: false })
    userName: string;

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
    phoneNumber: string;

    @Column({ nullable: false, default: false })
    isVerified: boolean;

    @Column({ nullable: false, default: false })
    isDeleted: boolean;

    @OneToMany(() => Order, order => order.user)
    orders: Partial<Order>[]

    @OneToOne(() => Address, address => address.user)
    @JoinColumn()
    address: Partial<Address>

    @OneToOne(() => VerificationCode, verificationCode => verificationCode.user, { onUpdate: 'CASCADE' })
    @JoinColumn()
    verificationCode: Partial<VerificationCode>

    @CreateDateColumn({
        type: 'timestamp with time zone',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}