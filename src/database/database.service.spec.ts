import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to the database on init', async () => {
    // Mockeamos el método $connect de PrismaClient
    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
  });
});
