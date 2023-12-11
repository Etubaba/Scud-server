import {
    BadRequestException,
    HttpCode,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    forwardRef,
} from '@nestjs/common';
import { Verification } from '@prisma/client';
import * as moment from 'moment';
import { OrmService } from 'src/database/orm.service';
import { MediaService } from '../../media/media.service';
import { UsersService } from '../../users/users.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { VehicleBrandService } from './vehicle-brand.service';
import { VehicleTypeService } from './vehicle-type.service';

@Injectable()
export class VehicleService {
    selectFields = {
        id: true,
        manufacture_date: true,
        verification: true,
        model: true,
        color: true,
        frsc_number: true,
        images: true,
        vehicle_brand: {
            select: {
                name: true,
            },
        },
        user: {
            select: {
                id: true,
                first_name: true,
                last_name: true,
                phone: true,
                email: true,
            },
        },
        vehicle_type: {
            select: {
                id: true,
                name: true,
            },
        },
        created_at: true,
        updated_at: true,
    };
    constructor(
        private readonly ormService: OrmService,
        @Inject(forwardRef(() => UsersService))
        private readonly userService: UsersService,
        private readonly cloudinaryService: MediaService,
        private readonly vehicleBrandService: VehicleBrandService,
        private readonly vehicleTypeService: VehicleTypeService,
    ) {}

    async list() {
        return await this.ormService.vehicle.findMany({
            select: this.selectFields,
            orderBy: {
                created_at: 'desc',
            },
        });
    }

    async create(dto: CreateVehicleDto, images: Array<Express.Multer.File>) {
        const brand = await this.vehicleBrandService.findOne(
            +dto.vehicle_brand_id,
        );
        await this.userService.findOne(+dto.user_id);
        if (!brand) {
            throw new HttpException(
                'Vehicle brand not found',
                HttpStatus.BAD_REQUEST,
            );
        }
        if (moment(dto.manufacture_date).isSameOrAfter(moment())) {
            throw new BadRequestException('Date must be less than now');
        }

        const vehicle_type = await this.getVehicleType(dto.manufacture_date);

        const uploadedImages = (
            await this.cloudinaryService.uploadManyImages(
                images,
                'images/vehicle',
            )
        ).map((val) => val.url);

        return await this.ormService.vehicle.create({
            data: {
                user_id: +dto.user_id,
                vehicle_brand_id: brand.id,
                color: dto.color,
                frsc_number: dto.frsc_number,
                model: dto.model,
                manufacture_date: moment(dto.manufacture_date).toDate(),
                images: uploadedImages,
                vehicle_type_id: vehicle_type.id,
            },
            select: this.selectFields,
        });
    }

    async update(
        dto: UpdateVehicleDto,
        id: number,
        images: Array<Express.Multer.File>,
    ) {
        const vehicle = await this.findOne(id);
        if (vehicle.verification == Verification.verified) {
            throw new HttpException(
                'Vehicle can not be updated',
                HttpStatus.CONFLICT,
            );
        }
        if (
            dto.manufacture_date &&
            moment(dto.manufacture_date).isSameOrAfter(moment())
        ) {
            throw new BadRequestException('Date must be less than now');
        }
        let data = {
            vehicle_brand_id: dto.vehicle_brand_id,
            color: dto.color,
            frsc_number: dto.frsc_number,
            model: dto.model,
            manufacture_date: dto.manufacture_date
                ? moment(dto.manufacture_date).toDate()
                : undefined,
        };

        if (images.length) {
            const uploadedImages = await (
                await this.cloudinaryService.uploadManyImages(
                    images,
                    'images/vehicle',
                )
            ).map((val) => val.url);
            data['images'] = uploadedImages;
        }

        if (dto.manufacture_date) {
            const vehicle_type = await this.getVehicleType(
                dto.manufacture_date,
            );
            data['vehicle_type_id'] = vehicle_type.id;
        }

        return await this.ormService.vehicle.update({
            where: {
                id: +id,
            },
            data: data,
            select: this.selectFields,
        });
    }

    async findOne(id: number) {
        const vehicle = await this.ormService.vehicle.findUnique({
            where: {
                id: +id,
            },
            select: this.selectFields,
        });

        if (!vehicle) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }

        return vehicle;
    }

    async findByUser(id: number) {
        const vehicle = await this.ormService.vehicle.findFirst({
            where: {
                user_id: +id,
            },
            select: this.selectFields,
        });

        if (!vehicle) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }

        return vehicle;
    }

    async remove(id: number) {
        await this.findOne(id);
        return await this.ormService.vehicle.delete({
            where: {
                id: id,
            },
        });
    }

    /**
     * This function retrieves the vehicle type based on the manufacture date and throws an error if
     * the vehicle is not eligible for registration.
     * @param {string} manufacture_date - manufacture_date is a string representing the date of
     * manufacture of a vehicle.
     * @returns the vehicle type that matches the manufacture date provided as a parameter. If no
     * matching vehicle type is found, it throws an HttpException with a message indicating that the
     * vehicle can't be registered and the minimum year accepted.
     */
    async getVehicleType(manufacture_date: string) {
        const vehicle_types = await this.vehicleTypeService.list();

        const foundType = vehicle_types.find((vt) => {
            const found =
                moment(manufacture_date).isSameOrAfter(
                    moment(vt.minimum_year),
                ) &&
                moment(manufacture_date).isSameOrBefore(
                    moment(vt.maximum_year || new Date()),
                );
            return found;
        });

        const minimumYear = vehicle_types.sort(
            (type1, type2) =>
                Number(type1.minimum_year) - Number(type2.minimum_year),
        )[0].minimum_year;

        if (!foundType) {
            throw new HttpException(
                `Vehicle can't be registered...We only accept vehicle from ${moment(
                    minimumYear,
                ).format('YYYY')} above`,
                HttpStatus.BAD_REQUEST,
            );
        }

        return foundType;
    }
}
