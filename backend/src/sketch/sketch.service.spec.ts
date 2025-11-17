import { Test, TestingModule } from '@nestjs/testing';
import { SketchService } from './sketch.service';

describe('SketchService', () => {
  let service: SketchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SketchService],
    }).compile();

    service = module.get<SketchService>(SketchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
