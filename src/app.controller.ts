import { Controller, Get,  VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';

@Controller({
  path: '/',
  version: VERSION_NEUTRAL
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcome(): string {
    return this.appService.getWelcome();
  }
}
