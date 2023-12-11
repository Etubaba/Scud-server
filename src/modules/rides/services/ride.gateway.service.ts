import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
    RidesMeta,
    SocketUsers,
} from 'src/common/types/socketConnectedUsers.type';
import { SocketWithAuth } from 'src/common/types/socketWithAuth.type';
import { PUBLIC_ROLES } from 'src/modules/auth/roles';
import { UsersService } from 'src/modules/users/users.service';
import { Point } from 'redis-om';
import { UsersOnlineRepository } from 'src/modules/redis/repository/user.repository';
import { Namespace, Server, Socket } from 'socket.io';
import { RideRequestDto } from '../gateways/dto/ride-request.dto';
import { Coordinate } from 'src/modules/location/dtos/create-location.dto';
import { TripsService } from './trips.service';
import * as moment from 'moment';
import { FareService } from 'src/modules/fare/services/fare.service';
import { LocationServices } from 'src/modules/location/services/location.service';
import { MapStore } from '../helpers/map.store';
import { GoogleMapsApiService } from 'src/modules/google-maps-api/services/google-maps-api.service';
import { RideEndDto } from '../gateways/dto/ride-end.dto';
import { TripStatus } from '@prisma/client';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import RidesHelpers from '../helpers/rides.helpers';
import { TimeOnlineService } from 'src/modules/time-online/services/time_online.service';
import { CancelRideDto } from '../gateways/dto/cancel_ride.dto';
import { VehicleService } from 'src/modules/vehicle/services/vehicle.service';
import { VehicleTypeService } from 'src/modules/vehicle/services/vehicle-type.service';
interface DriverMapStore {
    driver: SocketUsers;
    metadata?: RidesMeta;
}

@Injectable()
export class RidesGatewayService {
    constructor(
        private readonly usersService: UsersService,
        private readonly usersOnlineRepository: UsersOnlineRepository,
        private readonly tripService: TripsService,
        private readonly faresService: FareService,
        private readonly googleMapService: GoogleMapsApiService,
        private readonly locationService: LocationServices,
        private readonly settingsService: SettingsService,
        private readonly mapStore: MapStore<DriverMapStore>,
        private readonly timeOnlineService: TimeOnlineService,
        private readonly vehicleService: VehicleService,
        private readonly vehicleTypeService: VehicleTypeService,
    ) {}

    async connect(client: SocketWithAuth) {
        const requestRole = client.handshake.headers.role as 'rider' | 'driver';
        const owe_limit = parseInt(
            (await this.settingsService.get('MAXIMUM_OWED_AMOUNT')).value,
        );
        const role = await this.roleAssinged(client.user.id, requestRole);
        if (role == 'NONE') {
            client.disconnect(true);
        }
        let vehicle;
        if (requestRole == 'driver') {
            vehicle = await this.vehicleService.findByUser(client.user.id);
        }
        // if (
        //     requestRole == 'driver' &&
        //     !(await this.usersService.driverCanBeOnline(client.user.id))
        // ) {
        //     client.emit('exception', {
        //         message: 'Please verify your details to come online',
        //     });
        //     client.disconnect(true);
        // }
        let owing = false;

        if (client.user.account_balance.toNumber() < 0) {
            owing =
                Math.abs(client.user.account_balance.toNumber()) < owe_limit;
        }
        const data: SocketUsers = {
            id: client.user.id,
            is_online: true,
            socket_id: client.id,
            acceptable_rides: !owing ? 'both' : 'cash',
            max_distance: client.user.max_pickup_distance || null,
            fence: '',
            is_in_ride: false,
            arrival_time: 0,
            location: {
                latitude:
                    parseInt(<string>client.handshake.headers.latitude) || null,
                longitude:
                    parseInt(<string>client.handshake.headers.longtitude) ||
                    null,
            },
            driverScore:
                requestRole == 'driver' ? client.user.credibility_score : null,
            role: requestRole,
            vehicle_type:
                requestRole == 'driver' ? vehicle.vehicle_type.name : '',
        };

        const isSaved = await this.usersOnlineRepository.get(data.id);
        if (isSaved && isSaved.is_online) {
            return;
        }
        if (isSaved) {
            const entityId = isSaved['entityId'];
            data.fence = isSaved.fence;
            if (
                data.location.latitude == null ||
                data.location.longitude == null
            ) {
                delete data.location;
            }
            await this.usersOnlineRepository.delete(entityId);
            const user = await this.usersOnlineRepository.push(
                Object.assign({}, isSaved, data),
            );
            await this.mapStore.saveTime(`${data.id}`, 'online', new Date());
            return user;
        }
        if (data.location.latitude == null || data.location.longitude == null) {
            data.location = null;
            console.log(JSON.stringify(data) + '   <data>');
        }
        const user = await this.usersOnlineRepository.push(data);
        await this.mapStore.saveTime(`${data.id}`, 'online', new Date());
        return user;
    }

    async disconnect(client: SocketWithAuth) {
        const user = await this.usersOnlineRepository.get(client.user.id);
        if (!user) return;
        user.is_online = false;
        await this.usersOnlineRepository.update(user.id, user);
        const timeInfo = await this.mapStore.saveTime(
            `${user.id}`,
            'offline',
            new Date(),
        );
        await this.timeOnlineService.create(user.id, {
            login_date: timeInfo.online,
            logout_date: timeInfo.offline,
        });
        return;
    }

    async updateLocation(
        id: number,
        data: Coordinate,
        client: SocketWithAuth,
        io: Namespace,
    ) {
        const user = await this.usersOnlineRepository.get(id);
        //  console.log(data);
        const location = await this.locationService.findByPoint(data);
        //console.log(location);
        if (user) {
            user.location = this.toPoint(data);
            user.socket_id = client.id;
        }
        if (!location && !user.is_in_ride) {
            throw new HttpException(
                'Not operating in these area',
                HttpStatus.BAD_REQUEST,
            );
        }
        if (user.is_in_ride) {
            const trip = await this.tripService.findByDriver(
                user.id,
                'ongoing',
            );
            const info = await this.googleMapService.distanceMatrix(
                data,
                trip.destination_coords as unknown as Coordinate,
            );
            if (info) {
                const {
                    rows: [
                        {
                            elements: [{ duration }],
                        },
                    ],
                } = info;
                const duration_in_mins = Math.ceil(duration.value);
                user.arrival_time = duration_in_mins;
            }
            console.log(trip);

            io.to(trip.rider_id.toString()).emit('locationChange', {
                for: user.role,
                data,
            });
        }
        if (location) {
            user.fence = location.name;
        }
        const info = await this.usersOnlineRepository.update(id, user);
        const allListeners = await this.mapStore.getAllDriversSubscribers();
        const alldrivers = await this.usersOnlineRepository.findAllDrivers();
        allListeners.forEach((id) => {
            const driverSocket = io.sockets.get(id);
            driverSocket.emit('allDrivers', { alldrivers });
        });
        return info;
    }

    /**
     * It finds the closest driver to the rider.
     * </code>
     * @param {SocketWithAuth} client - SocketWithAuth - this is the client that is requesting the
     * driver   const waitTimeInS = 10;   const waitTimeInS = 10;
     * @returns The closest driver to the rider.
     */
    async findDriver(data: RideRequestDto) {
        const vehicle_type = (
            await this.vehicleTypeService.findOne(data.vehicle_type_id)
        ).name;
        const location = await this.locationService.findByPoint(data.pickup);
        return this.usersOnlineRepository.findClosestDriver(
            this.toPoint(data.pickup),
            location,
            data.mode,
            vehicle_type,
        );
    }
    async roleAssinged(id: number, role: string) {
        const user = await this.usersService.selectRelated(
            { id },
            {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        );

        const userRoles: string[] = user.roles.map((r) => r.role.name);
        const isPublic =
            userRoles.includes(PUBLIC_ROLES.DRIVER) ||
            userRoles.includes(PUBLIC_ROLES.RIDER);
        if (!isPublic) {
            return 'NONE';
        }
        return userRoles.includes(role);
    }

    // async createRoom(riderId: number, drivers: UsersOnline[]) {
    //     const [currentDriver, ...nextDrivers] = drivers;
    //     const data: RequestRoom = {
    //         id: riderId,
    //         current_driver_id: currentDriver.id,
    //         next_driver_ids: nextDrivers.map((driver) => driver.id + ''),
    //         rider_id: riderId,
    //     };
    //     const room = await this.redisUsersRepository
    //         ()
    //         .push(data);
    //     console.log(room);
    //     return room;
    // }

    // async deleteRoom(riderId: number) {
    //     const room = await this.redisRepository
    //         .getRequestRoomRepository()
    //         .get(riderId);
    //     if (room) {
    //         await this.redisRepository
    //             .getRequestRoomRepository()
    //             .delete(room['entity_id']);
    //     }
    //     return;
    // }

    async informDriver(
        roomId: string,
        io: Namespace,
        driver: SocketUsers,
        data: any,
    ) {
        const driverSocket = io.sockets.get(driver.socket_id);
        console.log(driverSocket);

        io.to(roomId).emit('connectingTo', driver);
        driverSocket.emit('requestRides', { data, room_id: roomId });
    }
    toPoint(coordinates: Coordinate): Point {
        return {
            latitude: +coordinates.latitude,
            longitude: +coordinates.longitude,
        };
    }

    async handleRideRequest(
        data: RideRequestDto,
        client: SocketWithAuth,
        io: Namespace,
    ) {
        try {
            const rider = client.user;
            const drivers = await this.findDriver(data);

            console.log(drivers);
            const roomId = rider.id + '';
            client.join(roomId);
            const location = await this.locationService.findByPoint(
                data.pickup,
            );
            const fare = await this.faresService.findByLocation(
                location.id,
                data.vehicle_type_id,
            );
            const info = await this.faresService.calculateDistanceFare(
                data.pickup,
                data.dropoff,
                location.id,
                data.vehicle_type_id,
            );

            const driversWithMeta = [];

            for (const driver of drivers) {
                driversWithMeta.push(
                    Object.assign(
                        {},
                        {
                            driver,
                            metadata: {
                                ...info,
                                pickup_coords: data.pickup,
                                destination_coords: data.dropoff,
                                location_fare: fare,
                                payment_mode: data.mode,
                                vehicle_type_id: data.vehicle_type_id,
                            },
                        },
                    ),
                );
            }
            await this.mapStore.set(roomId, new Set(driversWithMeta));
            const current_info = await this.mapStore.pop(roomId);
            if (current_info == null) {
                io.to(roomId).emit('connectFailed', {
                    data: {
                        message: 'No drivers available',
                    },
                });
                return;
            }
            await this.informDriver(roomId, io, current_info.driver, {
                origin_address: info.origin_address,
                rider: client.user,
            });
            return;
        } catch (e) {
            console.error(e);
            return {
                event: 'exception',
                data: { message: 'Error initializing rides' },
            };
        }
    }

    async handleRideResponse(data: any, client: SocketWithAuth, io: Namespace) {
        try {
            console.log(data);

            const accept = Boolean(data.accept);
            const roomId = data.room_id;
            const info = await this.mapStore.lastValue(roomId);
            const location = await this.locationService.findByPoint(
                info.metadata.pickup_coords,
            );
            await this.tripService.createRideRequest({
                destination: info.metadata.destination_address,
                pickup_location_id: location.id,
                driver_id: info.driver.id,
                rider_id: +roomId,
                status: accept ? 'accepted' : 'rejected',
            });
            if (accept) {
                client.join(roomId);
                io.to(roomId).emit('connectSuccess', {
                    driver: client.user,
                });

                const trip = await this.tripService.create({
                    rider_id: +roomId,
                    driver_id: info.driver.id,
                    pickup: info.metadata.origin_address,
                    destination: info.metadata.destination_address,
                    status: 'unstarted',
                    pickup_coords: info.metadata.pickup_coords,
                    destination_coords: info.metadata.destination_coords,
                    fare_id: info.metadata.location_fare.id,
                });
                await this.mapStore.connect(roomId, trip.id);
                await this.usersOnlineRepository.update(info.driver.id, {
                    ...info.driver,
                    is_in_ride: true,
                });
                return;
            }

            client.disconnect();
            const current_info = await this.mapStore.pop(roomId);
            if (current_info == null) {
                io.to(roomId).emit('connectFailed', {
                    data: {
                        message: 'No drivers available',
                    },
                });
                return;
            }
            await this.informDriver(roomId, io, current_info.driver, {
                origin_address: current_info.metadata.origin_address,
            });
            return;
        } catch (e) {
            console.log(e);
            return {
                event: 'exception',
                data: { message: 'Error accepting rides', error: e },
            };
        }
    }

    async handleDriverArrival(client: SocketWithAuth, io: Namespace) {
        try {
            const rooms = client.rooms;

            if (rooms.size > 1) {
                console.log([...rooms]);

                const id = [...rooms][1];
                console.log(id);
                const trip_id = await this.mapStore.getConnected(id);
                io.to(id).emit('driverHasArrived');
                await this.tripService.update(trip_id, {
                    driver_arrival: moment().toDate(),
                });
            }
        } catch (e) {
            return {
                event: 'exception',
                data: { message: 'Error occured', error: e },
            };
        }
    }

    async handleTripStart(client: SocketWithAuth, io: Namespace) {
        try {
            const rooms = client.rooms;
            if (rooms.size > 1) {
                const id = [...rooms][1];
                const trip_id = await this.mapStore.getConnected(id);
                await this.tripService.update(trip_id, {
                    status: 'ongoing',
                    start_date: moment().toDate(),
                });
                io.to(id).emit('tripStarted');
            }
        } catch (e) {
            return {
                event: 'exception',
                data: { message: 'Error occured', error: e },
            };
        }
    }

    async handleTripEnd(
        client: SocketWithAuth,
        io: Namespace,
        data: RideEndDto,
    ) {
        const { role } = await this.usersOnlineRepository.get(client.user.id);
        //  const status: TripStatus =  role == 'driver' ? 'completed' : 'cancelled';
        const status: TripStatus = 'completed';
        try {
            const rooms = client.rooms;
            if (rooms.size > 1) {
                const roomId = [...rooms][1];
                const trip_id = await this.mapStore.getConnected(roomId);
                const {
                    metadata: { payment_mode, vehicle_type_id },
                    driver,
                } = await this.mapStore.lastValue(roomId);
                const end_date = moment();
                const trip = await this.tripService.find(trip_id);
                const time = Math.ceil(
                    moment(end_date).diff(
                        moment(trip.start_date),
                        'minutes',
                        true,
                    ),
                );
                await this.tripService.update(trip.id, {
                    status,
                    duration: time,
                    end_date: end_date.toDate(),
                });

                const wait_time = Math.ceil(
                    moment(trip.start_date).diff(
                        moment(trip.driver_arrival),
                        'minutes',
                        true,
                    ),
                );

                const mapsInfo = await this.googleMapService.distanceMatrix(
                    trip.pickup_coords as unknown as Coordinate,
                    data.dropoff,
                );
                const {
                    rows: [
                        {
                            elements: [{ distance }],
                        },
                    ],
                } = mapsInfo;
                const haversine = RidesHelpers.distanceBetween(
                    this.toPoint(trip.pickup_coords as unknown as Coordinate),
                    this.toPoint(data.dropoff),
                );
                console.log(mapsInfo, 'Map Info');
                console.log(haversine, 'Haversine');

                let distanceInM = 0;
                if (!distance || !distance.value) {
                    distanceInM = haversine;
                } else {
                    distanceInM = distance.value;
                }
                const distanceInKm = Math.ceil(distanceInM / 1000);

                const fare_info = await this.faresService.calculatePrice(
                    time,
                    distanceInKm,
                    trip.fare.location_id,
                    vehicle_type_id,
                    wait_time,
                );
                const tripfare = await this.tripService.createTripFare(
                    trip.id,
                    {
                        total: fare_info.price,
                        base_fare: fare_info.base.base_fare,
                        payment_mode,
                    },
                );
                io.to(roomId).emit('tripEnded', {
                    fare: fare_info,
                    id: trip.id,
                });
                const { account_balance } = await this.usersService.findOne(
                    driver.id,
                );
                const newaccbal =
                    payment_mode == 'card'
                        ? account_balance.toNumber() +
                          tripfare.driver_commission
                        : account_balance.toNumber() -
                          tripfare.admin_commission;
                await this.usersService.updateFields(driver.id, {
                    account_balance: newaccbal,
                });
                await this.usersOnlineRepository.update(driver.id, {
                    ...driver,
                    is_in_ride: false,
                });
                io.sockets.forEach((s) => {
                    s.leave(roomId);
                });
            }
        } catch (e) {
            console.log(e);

            return {
                event: 'exception',
                data: { message: 'Error occured', error: e },
            };
        }
    }

    async findAllDrivers(
        client: SocketWithAuth,
        io: Namespace,
        mapStore: MapStore<{ driver: SocketUsers; metadata?: RidesMeta }>,
    ) {
        mapStore.addDriverSunscriber(client.id);
        const data = await this.usersOnlineRepository.findAllDrivers();
        client.emit('allDrivers', { data });
    }

    async handleCancelRide(
        client: SocketWithAuth,
        io: Namespace,
        mapStore: MapStore<{ driver: SocketUsers; metadata?: RidesMeta }>,
        data: CancelRideDto,
    ) {
        try {
            const rooms = client.rooms;
            const user = await this.usersOnlineRepository.get(client.user.id);
            if (rooms.size > 1) {
                const roomId = [...rooms][1];
                const trip_id = await this.mapStore.getConnected(roomId);
                const trip = await this.tripService.findUnstarted(trip_id);
                await this.tripService.update(trip.id, {
                    status: 'cancelled',
                    duration: 0,
                    end_date: new Date(),
                    cancelledBy: user.role,
                    cancel_reason: data.cancel_reason,
                });
                io.to(roomId).emit('tripCancelled');
            }
        } catch (e) {}
    }
}
