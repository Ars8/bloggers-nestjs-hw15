import { Controller, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { TestingService } from './testing.service';

@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/all-data')
  async clearDB() {
    try {
      return await this.testingService.removeAll();
    } catch (e) {
      console.log(e);
    }
  }
}
