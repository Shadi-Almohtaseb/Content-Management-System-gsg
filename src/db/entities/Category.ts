import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { Product } from "./Product.js";

@Entity('categories')
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: string;

    @Column({ length: 255, nullable: false })
    name: string

    @Column({ type: 'text', nullable: false })
    image: string

    @Column({ type: 'text', nullable: true })
    description: string

    @ManyToMany(() => Product, product => product.category)
    products: Product[]

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}