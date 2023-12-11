import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
    MulterModuleOptions,
    MulterOptionsFactory,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { IMAGE_MIME_TYPE } from '../types/mime.types';

// @Injectable()
export class FileInterceptorConfig implements MulterOptionsFactory {
    constructor(
        private readonly allowedTypes: string[] = IMAGE_MIME_TYPE,
        private readonly destination?: string,
    ) {}

    createMulterOptions(): MulterModuleOptions {
        return {
            storage: diskStorage({
                destination: this.destination,
                filename: (_req, _file, callback) => {
                    callback(
                        null,
                        'upload' + Date.now() + extname(_file.originalname),
                    );
                },
            }),
            fileFilter: (_, file, callback) => {
                if (this.allowedTypes.includes(file.mimetype)) {
                    callback(null, true);
                } else {
                    callback(
                        new HttpException(
                            `Unsupported file type ${file.mimetype}`,
                            HttpStatus.BAD_REQUEST,
                        ),
                        false,
                    );
                }
            },
        };
    }
}
