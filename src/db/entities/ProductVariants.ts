import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { Product } from './Product.js';

@Entity("product_variants")
export class ProductVariant extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    variant_id: number;

    @ManyToOne(() => Product, product => product.variants)
    @JoinColumn({ name: 'product_id' })
    product: Partial<Product>;

    @Column({ type: 'simple-json', nullable: true })
    dimensions: { length: number; width: number; height: number };

    @Column({ type: 'text', nullable: false })
    color: string;

    @Column({ nullable: false, type: "float" })
    originalPrice: number

    @Column({ nullable: true, type: "float" })
    discountPrice: number

    @Column({ nullable: false })
    stock_quantity: number

    @Column({ nullable: true, default: 0 })
    sold_out: number
}
