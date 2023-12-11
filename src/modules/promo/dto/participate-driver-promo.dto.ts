import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { RecordIsInDb } from "src/common/decorators/record_is_in_db.decorator";

export class ParticipateDriverPromoDto {

    @ApiProperty({
        description: 'Driver Promo id',
        example: 1,
    })
    @IsNumber()
    @RecordIsInDb("driverPromo.id")
    @IsNotEmpty()
    driver_promo_id: number;
}