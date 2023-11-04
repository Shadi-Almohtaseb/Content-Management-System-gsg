import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Shop } from "./Shop.js";
import { Category } from "./Category.js";

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

    @Column({ nullable: false })
    originalPrice: number

    @Column({ nullable: true })
    discountPrice: number

    @Column({ nullable: false })
    stock: number

    @Column({ nullable: false, type: 'simple-array' })
    size: string[]

    @Column({ nullable: false, type: 'simple-array' })
    color: string[]

    @Column({ type: 'float', nullable: true })
    rating: number;

    @Column({ nullable: false })
    authorId: string

    @Column({ nullable: false })
    sold_out: number

    @ManyToOne(() => Shop, shop => shop.products)
    shop: Partial<Shop>

    @ManyToMany(() => Category, category => category.products)
    @JoinTable()
    category: Partial<Category>;

    // @Column({ nullable: true })
    // tags: tags

    // @Column({ nullable: true })
    // reviews: reviews

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}