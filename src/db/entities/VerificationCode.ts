import { BaseEntity, Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.js";

@Entity('verification-codes')
export class VerificationCode extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    verificationCode: string;

    @OneToOne(() => User, user => user.verificationCode, { onDelete: 'CASCADE' })
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