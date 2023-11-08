import { BaseEntity, Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.js";

@Entity('user-otp-verifications')
export class UserOTPVerification extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    otp: string;

    @OneToOne(() => User, user => user.otp, { onDelete: 'CASCADE' })
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