import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { Shop } from "./Shop.js";
import { Category } from "./Category.js";
import { Tag } from "./Tag.js";
import { ProductVariant } from "./ProductVariants.js";

@Entity('products')
export class Product extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ length: 255, nullable: false })
    name: string

    @Column({ type: "text", nullable: false })
    short_description: string

    @Column({ type: "text", nullable: true })
    long_description: string

    @Column('simple-array', { nullable: false })
    images: string[];

    @Column({ type: 'float', nullable: true })
    rating: number;

    @ManyToOne(() => Shop, shop => shop.products)
    shop: Partial<Shop>

    @OneToMany(() => ProductVariant, variant => variant.product, { onDelete: "CASCADE" })
    variants: Partial<ProductVariant[]>;

    @ManyToMany(() => Category, category => category.products)
    @JoinTable({ name: "product_categories" })
    categories: Category[];

    @ManyToMany(() => Tag, tag => tag.products)
    @JoinTable({ name: "product_tags" })
    tags: Tag[];

    // @Column({ nullable: true })
    // reviews: reviews

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}