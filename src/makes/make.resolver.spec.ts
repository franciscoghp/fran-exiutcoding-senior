import { Test, TestingModule } from '@nestjs/testing';
import { MakesResolver } from './makes.resolver';
import { MakesService } from './makes.service';
import { MakeDto } from './types/make.dto';
import { PaginationInput } from './types/paginationInput.type';

describe('MakesResolver', () => {
  let resolver: MakesResolver;
  let service: MakesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MakesResolver,
        {
          provide: MakesService,
          useValue: {
            getMakes: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<MakesResolver>(MakesResolver);
    service = module.get<MakesService>(MakesService);
  });

  describe('makes', () => {
    it('should return a list of makes', async () => {
      const paginationInput: PaginationInput = { skip: 1, take: 10 };
      const mockMakes = { total: 2, items: [] as MakeDto[] };

      // Simula la respuesta del servicio
      jest.spyOn(service, 'getMakes').mockResolvedValue(mockMakes);

      const result = await resolver.makes(paginationInput);
      
      expect(result).toBe(mockMakes); // Verifica que el resultado sea el esperado
      expect(service.getMakes).toHaveBeenCalledWith(paginationInput, undefined); // Verifica que se llamó al servicio con los argumentos correctos
    });

    it('should call getMakes with actualize argument', async () => {
      const paginationInput: PaginationInput = { skip: 1, take: 10 };
      const mockMakes = { total: 2, items: [] as MakeDto[] };
      const actualize = true;

      // Simula la respuesta del servicio
      jest.spyOn(service, 'getMakes').mockResolvedValue(mockMakes);

      const result = await resolver.makes(paginationInput, actualize);
      
      expect(result).toBe(mockMakes); // Verifica que el resultado sea el esperado
      expect(service.getMakes).toHaveBeenCalledWith(paginationInput, actualize); // Verifica que se llamó al servicio con los argumentos correctos
    });

    it('should handle null pagination input gracefully', async () => {
      const mockMakes = { total: 0, items: [] as MakeDto[] };
      // Simula la respuesta del servicio
      jest.spyOn(service, 'getMakes').mockResolvedValue(mockMakes);

      const result = await resolver.makes(undefined); // Llama al resolver con input nulo
      
      expect(result).toEqual(mockMakes); // Verifica que el resultado sea el esperado
      expect(service.getMakes).toHaveBeenCalledWith(undefined, undefined); // Verifica que se llamó al servicio con los argumentos correctos
    });
  });
});
