import { IsInt, IsOptional, Length, Max, Min } from "class-validator";

export class createRatingDTO{

    @IsOptional()
    @IsInt({message: "Score must be a number " })
    @Min(1, {message: "The score must be at least 1 "})
    @Max(5, {message: "The score must be a maximum of 5 "})
    score: number;

    @IsOptional()
    comments: string;
}






















  // Relations
  @ManyToOne(() => RoadTrip, (trip) => trip.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip!: RoadTrip;

  @ManyToOne(() => User, (user) => user.givenRatings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'passengerId' })
  passenger!: User;

  @ManyToOne(() => User, (user) => user.receivedRatings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driverId' })
  driver!: User;

