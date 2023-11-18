import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { Product } from "./Product.js";

@Entity('categories')
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ length: 255, nullable: false, unique: true })
    name: string

    @Column({ type: 'text', nullable: false })
    image: string

    @Column({ type: 'text', nullable: true })
    description: string

    @ManyToMany(() => Product, product => product.categories)
    products: Partial<Product>[]
}