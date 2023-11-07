import { BaseEntity, Column, CreateDateColumn, Entity, BeforeInsert, OneToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { User } from "./User.js";
import bcrypt from 'bcrypt';

@Entity('user-otp-verifications')
export class UserOTPVerification extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    otp: string;

    @OneToOne(() => User, user => user.otp)
    @JoinColumn()
    user: Partial<User>;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    expiresAt: Date;
}