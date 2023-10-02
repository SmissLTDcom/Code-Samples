import {
  BaseEntity,
  Entity,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from "typeorm";
import { sortBy } from "lodash";
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { UniqueField } from "../utils/validators/UniqueFieldValidator";
import { Tenant } from "./Tenant.entity";
import { User } from "./User.entity";
import { Project } from "./Project.entity";
import { Validate } from "../utils/validators";
import { Position } from "./Position.entity";

@Entity()
export class Team extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @MaxLength(60)
  @Column({ length: 60, unique: true })
  @UniqueField({ message: "This team name is already taken" })
  @IsNotEmpty()
  name: string;

  @Column({ nullable: true })
  @IsOptional()
  description: string;

  @Column({ default: false })
  isArchived: boolean;

  @IsOptional()
  @Column({ nullable: true })
  imageUrl: string;

  @IsDate()
  @IsOptional()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @ManyToOne((_) => Tenant, (tenant) => tenant.teams, {
    onDelete: "CASCADE",
    nullable: false,
  })
  tenant: Tenant;

  @ManyToMany((_) => User, (user) => user.teams)
  @ValidateNested()
  @JoinTable()
  users: User[];

  @ManyToMany((_) => Project, (project) => project.teams)
  @JoinTable()
  projects: Project[];

  @OneToMany((_) => Position, (position) => position.team)
  positions: Position[];

  @Column({ nullable: true })
  @IsOptional()
  @IsNumber()
  legacyId: number;

  usersCount: number;

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await Validate(this, Team);
  }

  @AfterLoad()
  setWorkingStatus() {
    this.users = sortBy(this.users, ["firstName", "lastName"]);
    const tz = this.tenant?.timezone || "Europe/Kiev";
    this.users.map((user) => {
      if (user.tasks) return user.formatForTeamStatus(tz);
      return user;
    });
  }

  @AfterLoad()
  formatImageURL() {
    if (this.imageUrl) {
      const newPrefix = `${process.env.SERVER_HOST}/media`;
      this.imageUrl = this.imageUrl.replace(process.env.MEDIA_PATH!, newPrefix);
    }
  }
}
