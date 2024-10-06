/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { MakesService } from './makes.service';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { UtilsService } from '../utils/utils.service';
import { MakesServiceUtils } from './makes.service.utils';
import axios from 'axios';

jest.mock('axios'); // Mock de axios

describe('MakesService', () => {
  let service: MakesService;
  let databaseService: DatabaseService;
  let configService: ConfigService;
  let utilsService: UtilsService;
  let makeServiceUtils: MakesServiceUtils;

  const mockDatabaseService = {
    actualization: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    make: {
      count: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    vehicleType: {
      upsert: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(1000),
  };

  const mockUtilsService = {
    createChunks: jest.fn(),
  };

  const mockMakesServiceUtils = {
    parseMakesXmlResponse: jest.fn(),
    parseVehicleTypesXmlResponse: jest.fn(),
    combineMakesWithTypes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MakesService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UtilsService, useValue: mockUtilsService },
        { provide: MakesServiceUtils, useValue: mockMakesServiceUtils },
      ],
    }).compile();

    service = module.get<MakesService>(MakesService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    configService = module.get<ConfigService>(ConfigService);
    utilsService = module.get<UtilsService>(UtilsService);
    makeServiceUtils = module.get<MakesServiceUtils>(MakesServiceUtils);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
 

  describe('getMakes', () => {
    it('should fetch makes from the database if already actualized', async () => {
      const paginationInput = { skip: 0, take: 10 };
      const mockLastActualizationAt = { date: new Date() };
      const mockMakesFromDb = { total: 5, items: [] };

      mockDatabaseService.actualization.findFirst.mockResolvedValue(mockLastActualizationAt);
      mockDatabaseService.make.count.mockResolvedValue(mockMakesFromDb.total);
      mockDatabaseService.make.findMany.mockResolvedValue(mockMakesFromDb.items);

      const result = await service.getMakes(paginationInput, false);

      expect(result).toEqual(mockMakesFromDb);
      expect(mockDatabaseService.actualization.findFirst).toHaveBeenCalled();
      expect(mockDatabaseService.make.count).toHaveBeenCalled();
    });

    it('should fetch makes from the external API if not actualized', async () => {
      const paginationInput = { skip: 0, take: 10 };
      const mockMakesResponse = { result: [] };
      const mockItems = [];

      mockDatabaseService.actualization.findFirst.mockResolvedValue(null);
      (axios.get as jest.Mock).mockResolvedValue({ status: 200, data: '<xml></xml>' });
      mockMakesServiceUtils.parseMakesXmlResponse.mockReturnValue(mockMakesResponse);
      mockUtilsService.createChunks.mockReturnValue([mockMakesResponse.result]);

      const result = await service.getMakes(paginationInput, false);

      expect(result.total).toBe(mockItems.length);
      expect(mockMakesServiceUtils.parseMakesXmlResponse).toHaveBeenCalled();
    });

    // it('should throw an error if fetch from external API fails', async () => {
    //   const paginationInput = { skip: 0, take: 10 };

    //   mockDatabaseService.actualization.findFirst.mockResolvedValue(null);
    //   (axios.get as jest.Mock).mockRejectedValue(new Error('API Error'));

    //   await expect(service.getMakes(paginationInput, false)).rejects.toThrow('Unable to fetch makes from NHTSA API\nAPI Error');
    // });
  });

  describe('saveMake', () => {
    it('should upsert vehicle types and make', async () => {
      const mockMakeDto = {
        makeId: 1,
        makeName: 'TestMake',
        vehicleTypes: [{ typeId: 1, typeName: 'Car' }],
      };

      await service.saveMake(mockMakeDto);

      expect(mockDatabaseService.vehicleType.upsert).toHaveBeenCalledWith(expect.objectContaining({
        create: expect.objectContaining({ typeId: mockMakeDto.vehicleTypes[0].typeId }),
        update: expect.objectContaining({ typeName: mockMakeDto.vehicleTypes[0].typeName }),
      }));

      expect(mockDatabaseService.make.upsert).toHaveBeenCalledWith(expect.objectContaining({
        create: expect.objectContaining({ makeId: mockMakeDto.makeId }),
        update: expect.objectContaining({ makeName: mockMakeDto.makeName }),
      }));

      expect(mockDatabaseService.actualization.create).toHaveBeenCalled();
    });
  });
});
