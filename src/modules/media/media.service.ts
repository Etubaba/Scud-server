import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import { unlink } from 'fs';
import { resolve } from 'path';

@Injectable()
export class MediaService {
    async uploadImage(
        file: Express.Multer.File,
        folder: string,
    ): Promise<UploadApiResponse> {
        const result = await v2.uploader.upload(file.path, { folder });
        return result;
    }

    async uploadManyImages(
        files: Array<Express.Multer.File>,
        folder: string,
    ): Promise<Array<UploadApiResponse>> {
        return Promise.all(files.map((file) => this.uploadImage(file, folder)));
    }

    async deleteFile(path: string) {
        return new Promise<void>((res, reject) => {
            unlink(resolve(path), (err) => {
                if (err) {
                    throw new HttpException(
                        'An error occurred...Try again',
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }
                res();
            });
        });
    }
}
