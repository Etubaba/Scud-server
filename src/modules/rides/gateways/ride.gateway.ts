import { UpdateUsersLocationDto } from './dto/update-location.dto';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets/interfaces';
import { Namespace, Server, Socket } from 'socket.io';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { BadRequestTransformationFilter } from 'src/modules/socket/exceptions/ws-catch-all.filter';
import { SocketWithAuth } from 'src/common/types/socketWithAuth.type';
import { User } from '@prisma/client';
import { RolesService } from 'src/modules/auth/services/roles.service';
import { UsersService } from 'src/modules/users/users.service';
import { PUBLIC_ROLES } from 'src/modules/auth/roles';
import { RidesGatewayService } from '../services/ride.gateway.service';
import { RideRequestDto } from './dto/ride-request.dto';
import { SocketIOAdapter } from 'src/modules/socket/adapters/socket-io.adapter';
import { FareService } from 'src/modules/fare/services/fare.service';
import { LocationServices } from 'src/modules/location/services/location.service';
import { MapStore } from '../helpers/map.store';
import {
    RidesMeta,
    SocketUsers,
} from 'src/common/types/socketConnectedUsers.type';
import { RideEndDto } from './dto/ride-end.dto';
import { CancelRideDto } from './dto/cancel_ride.dto';

@UseFilters(new BadRequestTransformationFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
    namespace: 'rides',
    cors: {
        origin: '*',
        allowedHeaders: '*',
        methods: '*',
    },
})
export class RidesGateway
    implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
    constructor(
        private readonly ridesGatewayService: RidesGatewayService,
        private readonly faresService: FareService,
        private readonly locationService: LocationServices,
        private readonly mapStore: MapStore<{
            driver: SocketUsers;
            metadata?: RidesMeta;
        }>,
    ) {}

    @WebSocketServer()
    io: Namespace;
    afterInit(server: any) {}
    handleDisconnect(client: any) {
        return this.ridesGatewayService.disconnect(client);
    }
    async handleConnection(client: SocketWithAuth) {
        return this.ridesGatewayService.connect(client);
    }

    @SubscribeMessage('updateLocation')
    async handleUpdateLocation(
        @MessageBody() data: UpdateUsersLocationDto,
        @ConnectedSocket() client: SocketWithAuth,
    ) {
        const message = await this.ridesGatewayService.updateLocation(
            client.user.id,
            data,
            client,
            this.io,
        );
        return { event: 'updateLocation', data: message };
    }

    @SubscribeMessage('requestRides')
    async handleRideRequest(
        @MessageBody() data: RideRequestDto,
        @ConnectedSocket() client: SocketWithAuth,
    ) {
        return this.ridesGatewayService.handleRideRequest(
            data,
            client,
            this.io,
        );
    }

    @SubscribeMessage('ridesResponse')
    async handleRespondToRides(
        @MessageBody() data: any,
        @ConnectedSocket() client: SocketWithAuth,
    ) {
        return this.ridesGatewayService.handleRideResponse(
            data,
            client,
            this.io,
        );
    }

    @SubscribeMessage('driverHasArrived')
    async handleDriverArrival(@ConnectedSocket() client: SocketWithAuth) {
        return this.ridesGatewayService.handleDriverArrival(client, this.io);
    }

    @SubscribeMessage('tripStart')
    async handleDriverStartTrip(@ConnectedSocket() client: SocketWithAuth) {
        return this.ridesGatewayService.handleTripStart(client, this.io);
    }

    @SubscribeMessage('endTrip')
    async handleEndTrip(
        @ConnectedSocket() client: SocketWithAuth,
        @MessageBody() data: RideEndDto,
    ) {
        return this.ridesGatewayService.handleTripEnd(client, this.io, data);
    }

    @SubscribeMessage('subscribeToFindAllDrivers')
    async findAllDrivers(@ConnectedSocket() client: SocketWithAuth) {
        return this.ridesGatewayService.findAllDrivers(
            client,
            this.io,
            this.mapStore,
        );
    }

    @SubscribeMessage('cancelTrip')
    async cancelTrip(
        @ConnectedSocket() client: SocketWithAuth,
        @MessageBody() data: CancelRideDto,
    ) {
        return this.ridesGatewayService.handleCancelRide(
            client,
            this.io,
            this.mapStore,
            data,
        );
    }
}
