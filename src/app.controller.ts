import { Controller, Get, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Controller({
  path: '/',
  version: VERSION_NEUTRAL
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getWelcome(): string {
    return this.appService.getWelcome();
  }
}
