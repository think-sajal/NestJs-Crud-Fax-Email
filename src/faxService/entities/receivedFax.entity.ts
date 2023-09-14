import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ReceivedFax extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  to: string;

  @Column()
  from: string;

  @Column('timestamp')
  dateReceived: Date;
}