import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import bcrypt from 'bcrypt';
import { Order } from './Order.js';
import { Address } from './Address.js';
import { VerificationCode } from './VerificationCode.js';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsUUID,
} from 'class-validator';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    default:
      'https://e7.pngegg.com/pngimages/84/165/png-clipart-united-states-avatar-organization-information-user-avatar-service-computer-wallpaper-thumbnail.png',
  })
  @IsOptional()
  @IsString()
  avatar: string;

  @Column({ length: 255, nullable: false })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @Column({ nullable: false, unique: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @Column({ nullable: false })
  @IsNotEmpty()
  @IsString()
  @Length(8, 20)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,20}$/, {
    message:
      'Password must be 8-20 characters long, include at least one letter and one number.',
  })
  password: string;

  @Column({ nullable: true, unique: true })
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @Column({ nullable: false, default: false })
  isVerified: boolean;

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

  @Column({ nullable: false, default: 'User' })
  role: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Partial<Order>[];

  @OneToOne(() => Address, (address) => address.user)
  @JoinColumn({ name: 'address_id' })
  address: Partial<Address>;

  @OneToOne(
    () => VerificationCode,
    (verificationCode) => verificationCode.user,
    { onUpdate: 'CASCADE' }
  )
  @JoinColumn({ name: 'verification_code_id' })
  verificationCode: Partial<VerificationCode>;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
}
