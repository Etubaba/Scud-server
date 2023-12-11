import { Test, TestingModule } from '@nestjs/testing';
import { GoogleMapsApiService } from './google-maps-api.service';

describe('GoogleMapsApiService', () => {
    let service: GoogleMapsApiService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GoogleMapsApiService],
        }).compile();

        service = module.get<GoogleMapsApiService>(GoogleMapsApiService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
