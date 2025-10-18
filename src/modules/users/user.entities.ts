import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    anonymousUser: boolean;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true })
    password?: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}