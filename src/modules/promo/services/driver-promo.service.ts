import {
    BadRequestException,
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import * as moment from 'moment';
import { OrmService } from 'src/database/orm.service';
import { CreateDriverPromoDto } from '../dto/create-driver-promo.dto';
import { UpdateDriverPromoDto } from '../dto/update-driver-promo.dto';
import { ParticipateDriverPromoDto } from '../dto/participate-driver-promo.dto';
import { User } from '@prisma/client';
import { RolesService } from 'src/modules/auth/services/roles.service';

@Injectable()
export class DriverPromoService {
    constructor(
        private readonly ormService: OrmService,
        private readonly roleService: RolesService
    ) {}

    async list() {
        return this.cleanRelations(
            await this.ormService.driverPromo.findMany({
                include: {
                    LocationDriverPromo: {
                        select: {
                            location: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    VehicleTypeDriverPromo: {
                        select: {
                            vehicle_type: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
        );
    }

    async create(dto: CreateDriverPromoDto) {
        if (moment(dto.expires_at).isSameOrBefore(moment())) {
            throw new HttpException(
                'Expiry must be greater than today',
                HttpStatus.BAD_REQUEST,
            );
        }

        const promoExists = await this.ormService.driverPromo.findFirst({
            where: {
                name: dto.name,
            },
        });

        if (promoExists) {
            throw new HttpException(
                'Driver promo already exists',
                HttpStatus.CONFLICT,
            );
        }

        const newPromo = await this.ormService.driverPromo.create({
            data: {
                name: dto.name,
                acceptance_rate: dto.acceptance_rate,
                cancellation_rate: dto.cancellation_rate,
                driver_score: dto.driver_score,
                online_hours: dto.online_hours,
                expires_at: moment(dto.expires_at).format(),
                trips: dto.trips,
                is_active: dto.is_active,
            },
        });

        await this.createRelations(dto, 'create', newPromo.id);

        /* Returning the updated record. */
        return this.cleanRelations(
            await this.ormService.driverPromo.findFirst({
                where: {
                    id: newPromo.id,
                },  
                include: {
                    LocationDriverPromo: {
                        select: {
                            location: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    VehicleTypeDriverPromo: {
                        select: {
                            vehicle_type: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
        );
    }

    async findOne(id: number) {
        const promo = await this.ormService.driverPromo.findFirst({
            where: {
                id,
            },
            include: {
                LocationDriverPromo: {
                    select: {
                        location: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                VehicleTypeDriverPromo: {
                    select: {
                        vehicle_type: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!promo) {
            throw new NotFoundException('Record not found');
        }

        return this.cleanRelations(promo);
    }

    async update(id: number, dto: UpdateDriverPromoDto) {
        await this.findOne(id);

        if (dto.expires_at && moment(dto.expires_at).isSameOrBefore(moment())) {
            throw new BadRequestException('Expiry must be greater than today');
        }

        const promoExists = await this.ormService.driverPromo.findFirst({
            where: {
                name: dto.name,
                NOT: {
                    id,
                },
            },
        });

        if (promoExists) {
            throw new ConflictException('Driver promo already exists');
        }

        await this.ormService.driverPromo.update({
            where: { id },
            data: {
                name: dto.name,
                acceptance_rate: dto.acceptance_rate,
                cancellation_rate: dto.cancellation_rate,
                driver_score: dto.driver_score,
                online_hours: dto.online_hours,
                expires_at: dto.expires_at
                    ? moment(dto.expires_at).format()
                    : undefined,
                trips: dto.trips,
                is_active: dto.is_active,
            },
        });

        if (dto.location_ids && dto.location_ids.length > 0) {
        }
        await this.createRelations(dto, 'update', id);

        /* Returning the updated record. */
        return this.cleanRelations(
            await this.ormService.driverPromo.findFirst({
                where: {
                    id,
                },
                include: {
                    LocationDriverPromo: {
                        select: {
                            location: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    VehicleTypeDriverPromo: {
                        select: {
                            vehicle_type: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
        );
    }

    async remove(id: number) {
        await this.findOne(id);

        return this.ormService.driverPromo.delete({
            where: { id },
        });
    }

    async participateInPromo (dto: ParticipateDriverPromoDto, user: User) {
        
        await this.promoConstraints(user.id, dto.driver_promo_id)

        return this.ormService.userDriverPromo.create({
            data: {
                driver_id: user.id,
                driver_promo_id: dto.driver_promo_id
            }
        })
    }

    /**
     * This function retrieves the progress of a promotional campaign and its participants.
     * @param {number} id - The id parameter is a number that represents the id of a driver promo.
     * @returns The function `promoProgress` returns an object that contains information about a driver
     * promo and its participants.
     */
    async promoProgress (id: number) {

        await this.findOne(id)

        const promo = await this.ormService.driverPromo.findFirst({
            where: {
                id
            },
            include: {
                UserDriverPromo: {
                    include: {
                        driver: true
                    }
                }
            }
        })

        const participants = []

        for (let driver of promo.UserDriverPromo) {
            let progress = await this.computeDriverProgress(driver.driver_id, id)
            participants.push({
                ...driver.driver,
                progress
            })
        }
        
        delete promo.UserDriverPromo

        return {
            ...promo,
            participants
        }

    }


    /**
     * This function computes the progress of a driver towards completing a promotional offer based on
     * various criteria such as time online, completed trips, acceptance rate, cancellation rate, and
     * driver score.
     * @param {number} user_id - The ID of the driver user for whom the progress needs to be computed.
     * @param {number} promo_id - The promo_id parameter is a number that represents the ID of a driver
     * promotion.
     * @returns The function `computeDriverProgress` returns an object containing the progress of a
     * driver towards completing a promotional offer. The object includes the driver's time online,
     * number of completed trips, acceptance rate, cancellation rate, driver score, and a boolean
     * indicating whether the promotional offer has been completed or not.
     */
    async computeDriverProgress (user_id: number, promo_id: number) {

        const promoDetails = await this.ormService.driverPromo.findFirst({
            where: {
                id: promo_id
            }
        })

        const driverPromo = await this.ormService.userDriverPromo.findFirst({
            where: {
                driver_id: user_id,
                driver_promo_id: promo_id
            }
        })

        const timeOnline = (await this.ormService.timeOnline.aggregate({
            _sum: {
                time: true
            },
            where: {
                user_id,
                created_at: {
                    gte: driverPromo.assigned_at,
                    lte: promoDetails.expires_at
                }
            }
        }))._sum.time
        
        const trips = await this.ormService.trip.findMany({
            where: {
                driver_id: user_id,
                created_at: {
                    gte: driverPromo.assigned_at,
                    lte: promoDetails.expires_at
                },
            }
        })

        const rideRequests =  await this.ormService.rideRequest.findMany({
            where: {
                driver_id: user_id,
                created_at: {
                    gte: driverPromo.assigned_at,
                    lte: promoDetails.expires_at
                },
            }
        })

        const cancelledTrips = trips.filter((trip) => trip.cancelledBy === "driver")

        const driver_score = (await this.ormService.credibilityScore.aggregate({
            where: {
                user_id,
                created_at: {
                    gte: driverPromo.assigned_at,
                    lte: promoDetails.expires_at
                },
            },
            _avg: {
                current_score: true
            }
        }))._avg.current_score

        const acceptance_rate = (rideRequests.filter((rr) => rr.status === "accepted").length / rideRequests.length) * 100

        const progress = {
            time_online: (timeOnline / 60),
            trips_completed: trips.filter((trip) => trip.status === "completed").length,
            acceptance_rate,
            cancelation_rate: (cancelledTrips.length / trips.length) * 100,
            driver_score,
            completed: false,
            joined_at: driverPromo.assigned_at
        }

        if (
            progress.time_online >= promoDetails.online_hours &&
            progress.trips_completed >= promoDetails.trips &&
            progress.acceptance_rate >= promoDetails.acceptance_rate &&
            progress.cancelation_rate <= promoDetails.cancellation_rate &&
            progress.driver_score >= promoDetails.driver_score
        ) {
            progress.completed = true
        }

        return progress
    }
    
    /**
     * This function checks if a user is eligible to participate in a driver promo based on their
     * location, vehicle type, and if they are already participating.
     * @param {number} user_id - The ID of the user (driver) who wants to participate in the promo.
     * @param {number} promo_id - The ID of the promotional offer that the user is trying to
     * participate in.
     */
    async promoConstraints (user_id: number, promo_id: number) {

        const promoIsActive = await this.ormService.driverPromo.findFirst({
            where: {
                id: promo_id,
                is_active: true
            },
            include: {
                LocationDriverPromo: {
                    select: {
                        location_id: true
                    }
                },
                VehicleTypeDriverPromo: {
                    select: {
                        vehicle_type_id: true
                    }
                }
            }
        })

        if (
            !promoIsActive || 
            moment(promoIsActive.expires_at).isSameOrBefore(moment())
        ){
            throw new HttpException(
                "Promo is no longer active",
                HttpStatus.CONFLICT
            )
        }

        const driverRole = await this.roleService.findByName('driver');
        
        const isDriver = await this.ormService.user.findFirst({
            where: {
                id: user_id,
                roles: {
                    some: {
                        role_id: driverRole.id,
                    },
                },
            }
        })

        if (!isDriver) {
            throw new HttpException(
                'Only Drivers can participate in this promo', 
                HttpStatus.BAD_REQUEST
            );
        }

        const promoLocationIds = promoIsActive.LocationDriverPromo.map((location) => location.location_id)
        const vehicleTypesIds = promoIsActive.VehicleTypeDriverPromo.map((vehicle_type) => vehicle_type.vehicle_type_id)

        if (
            !promoLocationIds.includes(isDriver.location_id) || 
            !vehicleTypesIds.includes(isDriver.vehicle_type_id)
        ){
            throw new HttpException(
                "You're not eligible for this promo",
                HttpStatus.CONFLICT
            )
        }

        const alreadyParticipating = await this.ormService.userDriverPromo.findFirst({
            where: {
                driver_promo_id: promo_id,
                driver_id: user_id
            }
        })

        if (alreadyParticipating) {
            throw new HttpException(
                "Already participating in the promo",
                HttpStatus.CONFLICT
            )
        }

    }

    /**
     * This function creates or updates relations between a driver promo and its associated locations
     * and vehicle types.
     * @param {CreateDriverPromoDto | UpdateDriverPromoDto} dto -  is either a CreateDriverPromoDto or an
     * UpdateDriverPromoDto, which contains the data needed to create or update a driver promo.
     * @param {"create" | "update"} caller - The `caller` parameter is a string that specifies whether
     * the function is being called to create a new driver promo or update an existing one. It can have
     * a value of either "create" or "update".
     * @param {number} promo_id - The ID of the driver promo for which the relations are being created
     * or updated.
     */
    async createRelations(
        dto: CreateDriverPromoDto | UpdateDriverPromoDto,
        caller: 'create' | 'update',
        promo_id: number,
    ) {
        if (caller === 'update') {
            const promises = [];

            if (dto.location_ids && dto.location_ids.length > 0) {
                const deleteLocation =
                    this.ormService.locationDriverPromo.deleteMany({
                        where: {
                            driver_promo_id: promo_id,
                        },
                    });

                promises.push(deleteLocation);
            }

            if (dto.vehicle_type_ids && dto.vehicle_type_ids.length > 0) {
                const deleteVehicleTypes =
                    this.ormService.vehicleTypeDriverPromo.deleteMany({
                        where: {
                            driver_promo_id: promo_id,
                        },
                    });

                promises.push(deleteVehicleTypes);
            }

            await Promise.all(promises);
        }

        const promises = [];

        if (dto.location_ids && dto.location_ids.length > 0) {
            const locationDriverPromo = dto.location_ids.map((location_id) => {
                return {
                    driver_promo_id: promo_id,
                    location_id: location_id,
                };
            });

            const createLocations =
                this.ormService.locationDriverPromo.createMany({
                    data: locationDriverPromo,
                });

            promises.push(createLocations);
        }

        if (dto.vehicle_type_ids && dto.vehicle_type_ids.length > 0) {
            const vehicleTypeDriverPromo = dto.vehicle_type_ids.map(
                (vehicle_type_id) => {
                    return {
                        driver_promo_id: promo_id,
                        vehicle_type_id,
                    };
                },
            );

            const createVehicleTypes =
                this.ormService.vehicleTypeDriverPromo.createMany({
                    data: vehicleTypeDriverPromo,
                });

            promises.push(createVehicleTypes);
        }

        await Promise.all(promises);
    }

    /**
     * The function cleans up relations in an array or object by mapping and deleting certain
     * properties.
     * @param {T} promos - The parameter `promos` is of type `T`, which can be either an array or an
     * object. `promos` contains properties `LocationDriverPromo` and `VehicleTypeDriverPromo`,
     * which are arrays of objects with properties `location` and `vehicle_type
     * @returns the cleaned `promos` object or array with the `LocationDriverPromo` and
     * `VehicleTypeDriverPromo` properties removed and replaced with `locations` and `vehicle_types`
     * properties respectively, which contain an array of names extracted from the original properties.
     * If `promos` is an array, the function returns an array of cleaned `promo` objects.
     */
    async cleanRelations<T extends Array<T> | Record<string, any>>(promos: T) {
        if (Array.isArray(promos)) {
            return promos.map((promo) => {
                promo.locations = promo.LocationDriverPromo.map(
                    (promo_location) => {
                        return promo_location.location.name;
                    },
                );

                promo.vehicle_types = promo.VehicleTypeDriverPromo.map(
                    (promo_vehicle_type) => {
                        return promo_vehicle_type.vehicle_type.name;
                    },
                );

                delete promo.LocationDriverPromo;
                delete promo.VehicleTypeDriverPromo;

                return promo;
            });
        }

        promos.locations = promos.LocationDriverPromo.map((promo_location) => {
            return promo_location.location.name;
        });

        promos.vehicle_types = promos.VehicleTypeDriverPromo.map(
            (promo_vehicle_type) => {
                return promo_vehicle_type.vehicle_type.name;
            },
        );

        delete promos.LocationDriverPromo;
        delete promos.VehicleTypeDriverPromo;

        return promos;
    }
}
