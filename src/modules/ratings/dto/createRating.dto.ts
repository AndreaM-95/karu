import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class createRatingDTO{

    @ApiProperty({description: 'ID of the trip being rated',example: 128, type: Number})
    @IsInt({ message: "Trip ID must be a number" })
    tripId: number;

    @ApiProperty({description: 'Rating score from 1 to 5',example: 5,minimum: 1,maximum: 5,type: Number})
    @IsInt({message: "Score must be a number" })
    @Min(1, {message: "The score must be at least 1 "})
    @Max(5, {message: "The score must be a maximum of 5 "})
    score: number;

    @ApiProperty({description: 'Optional comment about the trip',example: 'Very good driver, the trip was comfortable.',required: false,type: String})
    @IsOptional()
    @IsString({ message: "Comments must be a string" })
    comments: string;
}





