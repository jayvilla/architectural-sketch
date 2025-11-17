import { Test, TestingModule } from '@nestjs/testing';
import { SketchController } from './sketch.controller';

describe('SketchController', () => {
  let controller: SketchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SketchController],
    }).compile();

    controller = module.get<SketchController>(SketchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
