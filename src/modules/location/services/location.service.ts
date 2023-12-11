import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { City, Location } from '@prisma/client';
import { OrmService } from 'src/database/orm.service';
import { Coordinate, CreateLocationDto } from '../dtos/create-location.dto';
import { UpdateLocationDto } from '../dtos/update-location.dto';

@Injectable()
export class LocationServices {
    constructor(private ormService: OrmService) {}

    /**
     * It takes an array of coordinates and returns a string of coordinates separated by commas.
     * @param {Coordinate[]} coordinates - Coordinate[]
     * @returns A string of coordinates in the format of "latitude longitude,latitude
     * longitude,latitude longitude"
     */
    coordinatesToPolygon(coordinates: Coordinate[]): string {
        let polygon = '';

        /* Checking if the first and last coordinates are the same. If they are not, it adds the first
        coordinate to the end of the array. Making a Polygon */
        if (
            JSON.stringify(coordinates[0]) !==
            JSON.stringify(coordinates[coordinates.length - 1])
        ) {
            coordinates.push(coordinates[0]);
        }

        coordinates.forEach((coordinate) => {
            polygon += coordinate.longitude + ' ' + coordinate.latitude + ',';
        });

        return polygon.slice(0, -1);
    }

    /**
     * It takes a string in the format of a polygon and returns an array of coordinates.
     * @param {string} polygon - string - The polygon string that you want to convert to coordinates.
     * @returns An array of coordinates.
     */
    polygonToCoordinates(polygon: string): Coordinate[] {
        return polygon
            .replace('POLYGON((', '')
            .replace('))', '')
            .split(',')
            .map((point) => {
                const [latitude, longitude] = point.split(' ');
                return { latitude, longitude };
            });
    }

    /**
     * It takes an array of coordinates and checks if they are covered by any other location in the
     * database
     * @param {Coordinate[]} coordinates - Coordinate[] - an array of coordinates
     * @param {number} id - number = -1
     * @returns A boolean value.
     */
    async validateCoordinates(
        coordinates: Coordinate[],
        id: number = -1,
    ): Promise<boolean> {
        for (let i = 0; i < coordinates.length; i++) {
            const coords_match = await this.ormService.$queryRawUnsafe<
                Location[]
            >(
                'SELECT id FROM locations WHERE ST_CoveredBy(ST_GeometryFromText($1, 4326), coordinates) AND id != $2',
                'POINT(' +
                    coordinates[i].longitude +
                    ' ' +
                    coordinates[i].latitude +
                    ')',
                id,
            );

            if (coords_match.length) {
                return false;
            }
        }

        return true;
    }

    async list(city_id?: number): Promise<Location[]> {
        const where = isNaN(city_id)
            ? ''
            : 'where locations.city_id=' + city_id;

        const locationsFromDb = (await this.ormService.$queryRawUnsafe(
            'SELECT locations.id, locations.name, locations.is_active, locations.created_at, locations.city_id, locations.updated_at, ST_AsText(locations.coordinates) AS coordinates FROM locations JOIN cities on locations.city_id = cities.id ' +
                where,
        )) as Array<{
            id: number;
            name: string;
            is_active: boolean;
            coordinates: string;
            created_at: Date;
            city_id: number;
            updated_at: Date | null;
        }>;

        const locations = locationsFromDb.map((data) => {
            return {
                ...data,
                coordinates: this.polygonToCoordinates(data.coordinates),
            };
        });

        if (!locations) {
            throw new HttpException('Error Occurred', HttpStatus.CONFLICT);
        }

        return locations;
    }

    async create(createLocationDto: CreateLocationDto) {
        const nameExist = await this.ormService.location.findFirst({
            where: {
                name: createLocationDto.name,
            },
        });

        if (nameExist) {
            throw new HttpException(
                'Location already exists',
                HttpStatus.CONFLICT,
            );
        }

        const isValid = await this.validateCoordinates(
            createLocationDto.coordinates,
        );

        if (!isValid) {
            throw new HttpException(
                'Location already selected',
                HttpStatus.CONFLICT,
            );
        }

        const success = await this.ormService.$executeRawUnsafe(
            'INSERT INTO locations (name, coordinates, is_active,city_id) VALUES ($1, ST_GeometryFromText($2), $3,$4)',
            createLocationDto.name,
            'POLYGON((' +
                this.coordinatesToPolygon(createLocationDto.coordinates) +
                '))',
            createLocationDto.is_active,
            createLocationDto.city_id,
        );

        if (!success) {
            throw new HttpException('Error Occurred', HttpStatus.CONFLICT);
        }

        return createLocationDto;
    }

    /**
     * It takes a location id, queries the database for the location, and returns the location as a
     * JSON object.
     *
     * The problem is that the coordinates field is a PostGIS polygon, and I need to convert it to an
     * array of coordinates.
     *
     * I'm using the polygonToCoordinates function to do this
     *
     * The polygonToCoordinates function is defined as follows:
     * @param {number} id - number - the id of the location to be retrieved
     * @returns An array of objects with the following properties: name, is_active, coordinates.
     */
    async findOne(id: number) {
        const locationsFromDb = (await this.ormService.$queryRawUnsafe(
            'SELECT locations.id, locations.name, locations.is_active, locations.created_at, locations.city_id, locations.updated_at, ST_AsText(locations.coordinates) AS coordinates FROM locations JOIN cities on locations.city_id = cities.id WHERE locations.id = $1',
            id,
        )) as Array<{
            id: number;
            name: string;
            is_active: boolean;
            coordinates: string;
            created_at: Date;
            updated_at: Date | null;
            city_id: number;
        }>;

        const locations = locationsFromDb.map((data) => {
            return {
                ...data,
                coordinates: this.polygonToCoordinates(data.coordinates),
            };
        });

        if (!locations.length) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }

        return locations[0];
    }

    /**
     * It takes a point (longitude and latitude) and returns the location that contains that point
     * @param {Coordinate} point - Coordinate - the point to search for
     * @returns The location object.
     */
    async findByPoint(point: Coordinate): Promise<Location> {
        const locations = await this.ormService.$queryRawUnsafe<Location[]>(
            'SELECT id FROM locations WHERE ST_CoveredBy(ST_GeometryFromText($1, 4326), coordinates)',
            'POINT(' + point.longitude + ' ' + point.latitude + ')',
        );

        if (!locations.length) {
            return null;
        }

        return await this.findOne(locations[0].id);
    }

    async update(id: number, updateLocationDto: UpdateLocationDto) {
        await this.findOne(id);
        if (updateLocationDto.name) {
            const nameExist = await this.ormService.location.findFirst({
                where: {
                    name: updateLocationDto.name,
                    NOT: {
                        id: id,
                    },
                },
            });

            if (nameExist) {
                throw new HttpException(
                    'Location already exists',
                    HttpStatus.CONFLICT,
                );
            }
        }
        let coordinateSuccess = true;

        if (updateLocationDto.coordinates) {
            const isValid = await this.validateCoordinates(
                updateLocationDto.coordinates,
                id,
            );

            if (!isValid) {
                throw new HttpException(
                    'Location already selected',
                    HttpStatus.CONFLICT,
                );
            }

            coordinateSuccess = (await this.ormService.$executeRawUnsafe(
                'UPDATE locations SET coordinates = ST_GeometryFromText($1)',
                'POLYGON((' +
                    this.coordinatesToPolygon(updateLocationDto.coordinates) +
                    '))',
            )) as unknown as boolean;
        }

        const nameSuccess = await this.ormService.location.update({
            where: {
                id: id,
            },
            data: {
                name: updateLocationDto.name,
                is_active: updateLocationDto.is_active,
            },
        });

        if (!coordinateSuccess && !nameSuccess) {
            throw new HttpException('Error Occurred', HttpStatus.CONFLICT);
        }
        return await this.findOne(id);
    }

    async remove(id: number) {
        await this.findOne(id);
        return await this.ormService.location.delete({
            where: {
                id: id,
            },
        });
    }
}
