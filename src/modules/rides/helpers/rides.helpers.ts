import { Point } from 'redis-om';
import { SocketUsers } from 'src/common/types/socketConnectedUsers.type';
import { UsersOnline } from 'src/modules/redis/repository/user.repository';

export default class RidesHelpers {
    /**
     * The function calculates the distance between two points on a sphere.
     * @param {Point} location1 - The first location.
     * @param {Point} location2 - The location of the user.
     * @returns The distance between two points on a sphere.
     */
    static distanceBetween(location1: Point, location2: Point) {
        /* The radius of the earth in kilometers. */
        const R = 6371;
        const lat1 = location1.latitude;
        const lon1 = location1.longitude;
        const lat2 = location2.latitude;
        const lon2 = location2.longitude;

        /* *|MARCADOR_CURSOR|* */
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const lat1Rad = lat1 * (Math.PI / 180);
        const lat2Rad = lat2 * (Math.PI / 180);

        /* Calculating the distance between two points on a sphere. */
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) *
                Math.sin(dLon / 2) *
                Math.cos(lat1Rad) *
                Math.cos(lat2Rad);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;

        return d;
    }

    static sortByScore(drivers: SocketUsers[]) {
        return drivers.sort((a, b) => b.driverScore - a.driverScore);
    }

    static sortByDistance(drivers: SocketUsers[], riderLocation: Point) {
        return drivers
            .map((driver) => {
                return Object.assign({}, driver, {
                    distance: this.distanceBetween(
                        riderLocation,
                        driver.location,
                    ),
                });
            })
            .sort((a, b) => a.distance - b.distance);
    }
    static filterAndSort(drivers: SocketUsers[], riderLocation: Point) {
        const filtered = this.sortByDistance(drivers, riderLocation);
        return this.sortByScore(filtered);
    }
}
