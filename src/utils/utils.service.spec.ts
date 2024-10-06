import { Test, TestingModule } from '@nestjs/testing';
import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtilsService],
    }).compile();

    service = module.get<UtilsService>(UtilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createChunks', () => {
    it('should split array into chunks of specified size', () => {
      const array = [1, 2, 3, 4, 5, 6];
      const chunkSize = 2;

      const result = service.createChunks(array, chunkSize);

      expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
    });

    it('should handle an array with a size not divisible by chunk size', () => {
      const array = [1, 2, 3, 4, 5];
      const chunkSize = 2;

      const result = service.createChunks(array, chunkSize);

      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should return the entire array as a single chunk if chunk size is larger than array', () => {
      const array = [1, 2, 3];
      const chunkSize = 10;

      const result = service.createChunks(array, chunkSize);

      expect(result).toEqual([[1, 2, 3]]);
    });

    it('should return an empty array when the input array is empty', () => {
      const array: number[] = [];
      const chunkSize = 2;

      const result = service.createChunks(array, chunkSize);

      expect(result).toEqual([]);
    });

    it('should handle chunk size of 1 (each element in its own chunk)', () => {
      const array = [1, 2, 3];
      const chunkSize = 1;

      const result = service.createChunks(array, chunkSize);

      expect(result).toEqual([[1], [2], [3]]);
    });
  });
});
