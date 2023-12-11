import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RecordIsActive } from 'src/common/decorators/record_active.decorator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';
export class CreateVehicleDto {
    @ApiProperty({
        description: 'Vehicle Brand Id',
        example: 1,
        type: Number,
    })
    @IsNotEmpty()
    @RecordIsActive('vehicleBrand.is_active', 'id')
    vehicle_brand_id: number;

    @ApiProperty({
        description: 'Model of the vehicle',
        example: 'Nisan2005NS',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    model: string;

    @ApiProperty({
        description: 'Color of the vehicle',
        example: 'Red',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    color: string;
    @ApiProperty({
        description: 'Date  of the manufacture of the vehicle',
        example: '2004-12-05',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    manufacture_date: string;

    @ApiProperty({
        description:
            'The FRSC Number assigned to the vehicle also known as plate number',
        example: '472628183Fe92',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    frsc_number: string;

    @ApiProperty({
        description: 'User id',
        example: '1212',
        type: Number,
    })
    @IsNotEmpty()
    user_id: number;
}
