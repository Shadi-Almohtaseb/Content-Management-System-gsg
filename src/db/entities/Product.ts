import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { Shop } from "./Shop.js";
import { Category } from "./Category.js";
import { Tag } from "./Tag.js";
import { Color } from "./Color.js";
import { Size } from "./Size.js";

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

    @Column('simple-array', { nullable: true }) //edit
    images: string[];

    @Column({ nullable: false })
    originalPrice: number

    @Column({ nullable: true })
    discountPrice: number

    @Column({ nullable: false })
    stock: number


    @Column({ type: 'float', nullable: true })
    rating: number;

    @Column({ nullable: true })
    sold_out: number

    @ManyToOne(() => Shop, shop => shop.products)
    shop: Partial<Shop>

    @OneToMany(() => Size, sizes => sizes.product)
    sizes: Partial<Size[]>

    @OneToMany(() => Color, colors => colors.product)
    colors: Partial<Color[]>

    @ManyToMany(() => Category, categories => categories.products)
    @JoinTable()
    categories: Partial<Category[]>;

    @ManyToMany(() => Tag, tag => tag.products)
    @JoinTable()
    tags: Tag[];

    // @Column({ nullable: true })
    // reviews: reviews

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}