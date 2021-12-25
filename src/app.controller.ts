import { Controller, Get, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CurrentUser } from './common/decorators/current-user';

@Controller({
  path: '/',
  version: VERSION_NEUTRAL,
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getWelcome(@CurrentUser() user: any): string {
    return this.appService.getWelcome();
  }
}
