import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Mail extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'mail_id' })
  id: number;

  @Column({ nullable: false, default: '' })
  body: string;

  @Column({ nullable: false, default: '' })
  subject: string;

  @Column({ nullable: false, default: '' })
  from: string;

  @Column('json', { nullable: true})
  cc: string;

  @Column('json', { nullable: true})
  to: string;

  @Column({ nullable: false, default: false })
  isSent: boolean;

  @Column('json', { nullable: true })
  attachments: string[];
}
