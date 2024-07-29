import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import bcrypt from 'bcrypt';
import { Product } from './Product.js';
import { Address } from './Address.js';
import { Order } from './Order.js';
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

@Entity('shops')
export class Shop extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  shop_id: string;

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
  shopName: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description: string;

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

  @Column({ nullable: false, default: 'Shop' })
  @IsString()
  role: string;

  @OneToMany(() => Product, (product) => product.shop)
  products: Partial<Product>[];

  @OneToMany(() => Order, (order) => order.shop)
  orders: Partial<Order>[];

  @OneToOne(
    () => VerificationCode,
    (verificationCode) => verificationCode.shop,
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
