@Entity('pricingRules')
@Index(['vehicleType'])
@Index(['isActive'])
export class PricingRule {
  @PrimaryGeneratedColumn()
  idPricing!: number;

  @Column({ 
    type: 'enum', 
    enum: ['carro', 'moto'] 
  })
  vehicleType!: 'carro' | 'moto';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseFare!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  perKmRate!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minimumFare!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  effectiveFrom!: Date;
}
