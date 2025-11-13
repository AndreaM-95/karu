import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('locations')
export class Locations {
  @PrimaryGeneratedColumn()
  idLocation: number;

  @Column({ nullable: false })
  locality: string;

  @Column({ nullable: false })
  zone: string;

  @Column({ type: 'decimal', precision: 12, scale: 10 })
  latitude: number;

  @Column({ type: 'decimal', precision: 12, scale: 10 })
  longitude: number;
}
