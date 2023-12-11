import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Verification } from '@prisma/client';
import { Request } from 'express';
import * as moment from 'moment';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { MediaService } from '../../media/media.service';
import { UsersService } from '../../users/users.service';
import { CreateLicenseDto } from '../dto/create-license.dto';
import { UpdateLicenseDto } from '../dto/update-license.dto';

@Injectable()
export class LicenseService {
    model: string = 'license';
    constructor(
        private readonly ormService: OrmService,
        private readonly userService: UsersService,
        private readonly mediaService: MediaService,
        private readonly paginationService: PaginationService,
    ) {}

    async list(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                license_number: true,
                front_image: true,
                back_image: true,
                verification: true,
                created_at: true,
                updated_at: true,
                user: true,
            },
        );
    }

    async create(dto: CreateLicenseDto, images: Array<Express.Multer.File>) {
        const user = await this.userService.selectRelated(
            {
                id: +dto.user_id,
            },
            {
                license: true,
            },
        );
        if (!user) {
            throw new HttpException(
                'User does not exist',
                HttpStatus.BAD_REQUEST,
            );
        }

        if (user.license) {
            throw new HttpException(
                'User already has a license',
                HttpStatus.BAD_REQUEST,
            );
        }
        if (moment(dto.expiry).isSameOrBefore(moment())) {
            throw new HttpException(
                'License has already expired',
                HttpStatus.BAD_REQUEST,
            );
        }
        const uploadedImages = (
            await this.mediaService.uploadManyImages(images, 'images/license')
        ).map((val) => val.url);
        return await this.ormService.license.create({
            data: {
                user_id: +dto.user_id,
                license_number: dto.license_number,
                expiry: moment(dto.expiry).toDate(),
                front_image: uploadedImages[0],
                back_image: uploadedImages[1],
            },
        });
    }

    async update(
        dto: UpdateLicenseDto,
        id: number,
        images: Array<Express.Multer.File>,
    ) {
        const license = await this.findOne(id);
        if (license.verification === Verification.verified) {
            throw new HttpException(
                'License has been updated already',
                HttpStatus.CONFLICT,
            );
        }
        let data = {
            license_number: dto.license_number,
            verification: <Verification>dto.verification,
        };
        if (images.length) {
            const uploadedImages = (
                await this.mediaService.uploadManyImages(
                    images,
                    'images/license',
                )
            ).map((val) => val.url);

            data['front_image'] = uploadedImages[0];
            data['back_image'] = uploadedImages[1];
        }
        return await this.ormService.license.update({
            where: {
                id: +id,
            },
            data: data,
        });
    }

    async findOne(id: number) {
        const license = await this.ormService.license.findUnique({
            where: {
                id: +id,
            },
        });

        if (!license) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }

        return license;
    }

    async findByUser(id: number) {
        const license = await this.ormService.license.findUnique({
            where: {
                user_id: +id,
            },
        });

        if (!license) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }

        return license;
    }
    async remove(id: number) {
        await this.findOne(id);
        return await this.ormService.license.delete({
            where: {
                id: id,
            },
        });
    }
}
