import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SendFax extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  to: string;

  @Column()
  from: string;

  @Column('timestamp')
  dateSent: Date;

  @Column()
  mediaUrl: string;
}
