// EmailField.ts to store all email fields for notifications 
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from '@tsed/schema';

@Entity('email_config')
  @Index(['env', 'type'], { unique: true })
  export class EmailConfig extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Property()
  id: number;
  
  @Property()
  @Column({name: 'type'})
  type: string;
  
  @Property()
  @Column({name: 'env'})
  env: string;
  
  @Property()
  @Column({name: 'subject'})
  subject: string;
  
  @Property()
  @Column({name: 'template'})
  template: string;
  
  @Property()
  @Column({name: 'to'})
  to: string;
  
  @Property()
  @Column({name: 'from'})
  from: string;
  
  @Property()
  @Column({name: 'cc', nullable:true})
  cc?: string
  
  @Property()
  @Column({name: 'bcc', nullable:true})
  bcc?: string
  
  @Property()
  @Column({ name: 'status', nullable: true })
  status: string;
  
  @Property()
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;
  
  @Property()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;
  
  @Property()
  @Column({ name: 'created_user', nullable: true })
  createdUser: string;
  
  @Property()
  @Column({ name: 'updated_user', nullable: true })
  updatedUser: string;
