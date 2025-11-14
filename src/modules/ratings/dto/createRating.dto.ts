import { IsInt, IsOptional, Length, Max, Min } from "class-validator";
import { Trip } from "src/modules/trips/entities/trip.entity";

export class createRatingDTO{

    @IsInt()
    trip: Trip;

    @IsOptional()
    @IsInt({message: "Score must be a number " })
    @Min(1, {message: "The score must be at least 1 "})
    @Max(5, {message: "The score must be a maximum of 5 "})
    score: number;

    @IsOptional()
    comments: string;
}
