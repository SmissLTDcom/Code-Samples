import {
    BaseEntity,
    Entity,
    Column,
    CreateDateColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    BeforeInsert,
    BeforeUpdate,
  } from 'typeorm';
  import { IsDate, IsOptional, IsString, MaxLength } from 'class-validator';
  import { VacationRequest } from './VacationRequest.entity';
  import { User } from './User.entity';
  import { Validate } from '../utils/validators';
  
  @Entity()
  export class VacationComment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @IsString()
    @MaxLength(60)
    @Column({ length: 60 })
    title: string;
  
    @IsString()
    @MaxLength(160)
    @Column({ length: 160 })
    description: string;
  
    @ManyToOne((_) => VacationRequest, vacationRequest => vacationRequest.vacationComments, { onDelete: 'CASCADE' })
    vacationRequest: VacationRequest;
  
    @ManyToOne((_) => User, user => user.vacationComments, { onDelete: 'CASCADE' })
    user: User;
  
    @IsDate()
    @IsOptional()
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
  
    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
      await Validate(this, VacationComment);
    }
  }
  