import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Product } from "./Product.js";

@Entity('colors')
export class Color extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ length: 255, nullable: false, unique: true })
    name: string

    @ManyToOne(() => Product, product => product.colors)
    product: Partial<Product>[]
}