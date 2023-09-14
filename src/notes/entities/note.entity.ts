import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Note extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ length: 150 })
  public title: string;

  @Column()
  public description: string;
}
