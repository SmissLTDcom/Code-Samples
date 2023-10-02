import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  AfterLoad,
  VirtualColumn,
} from "typeorm";
import {
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  IsDateString,
  ValidateIf,
} from "class-validator";
import { User } from "./User.entity";
import { Project } from "./Project.entity";
import { Validate } from "../utils/validators";
import { TimeRange } from "./TimeRange.entity";
import { TimeFormatter } from "../utils";

@Entity()
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @MaxLength(60)
  @Column({ length: 60 })
  name: string;

  @Column({ nullable: true })
  @IsOptional()
  description: string;

  @Column({ default: false })
  isArchived: boolean;

  @IsDate()
  @IsOptional()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @IsDate()
  @IsOptional()
  @Column({ type: "timestamptz", nullable: true })
  archivedAt: Date | null;

  @IsDateString()
  @IsOptional()
  @ValidateIf((self) => !(self.lastTimeActive instanceof Date))
  @Column({ type: "timestamptz", nullable: true })
  lastTimeActive: string | Date | null;

  @Column({ nullable: true })
  @IsOptional()
  @IsNumber()
  projectId: number;

  @ManyToOne((_) => Project, (project) => project.tasks, {
    onDelete: "SET NULL",
  })
  project: Project;

  @Column()
  @IsOptional()
  @IsNumber()
  userId: number;

  @ManyToOne((_) => User, (user) => user.tasks, { onDelete: "CASCADE" })
  user: User;

  @OneToMany((_) => TimeRange, (timeRange) => timeRange.task)
  timeRanges: TimeRange[];

  // NON COLUMN FIELDS
  @VirtualColumn({ query: (_) => `SELECT NULL` })
  totalTracked?: number;
  @VirtualColumn({ query: (_) => `SELECT NULL` })
  totalTrackedAsString?: string;

  legacyId?: number;

  // HOOKS
  @AfterLoad()
  calculateTotals() {
    if (this.timeRanges) {
      this.totalTracked = TimeFormatter.totalTrackedFromRanges(this.timeRanges);
      this.totalTrackedAsString = TimeFormatter.millisecondsToDuration(
        this.totalTracked
      );
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await Validate(this, Task);
  }
}
