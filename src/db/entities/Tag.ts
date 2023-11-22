import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { Product } from "./Product.js";

@Entity('tags')
export class Tag extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ length: 255, nullable: false })
    name: string

    @ManyToMany(() => Product, product => product.tags)
    products: Partial<Product[]>
}