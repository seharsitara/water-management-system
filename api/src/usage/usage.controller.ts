import { Body, Controller, Get, Post } from '@nestjs/common'
import { UsageService } from './usage.service'
import { CreateUsageDto } from './dto/create-usage.dto'

@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get('dashboard')
  getDashboard() {
    return this.usageService.findDashboard()
  }

  @Post()
  createEntry(@Body() dto: CreateUsageDto) {
    return this.usageService.create(dto)
  }
}
