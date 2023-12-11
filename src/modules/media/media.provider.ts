import { v2 } from 'cloudinary';
import { CLOUDINARY } from 'src/common/constants/constants';

export const MediaProvider = {
    provide: CLOUDINARY,
    useFactory: () => {
        return v2.config({
            cloud_name: 'dfl69emmk',
            api_key: '978954421112463',
            api_secret: 'mr9XMf6zjzTPJ3jKVlHlEpykiMI',
        });
    },
};
