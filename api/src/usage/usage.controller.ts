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

  @Get('history')
  getHistory() {
    return this.usageService.findHistory()
  }

  @Get('categories')
  getCategories() {
    return this.usageService.getCategories()
  }

  @Post('categories')
  createCategory(@Body() body: any) {
    return this.usageService.createCategory(body)
  }

  @Get('settings')
  getUserSettings() {
    return this.usageService.getUserSettings()
  }

  @Post('settings')
  updateUserSettings(@Body() body: any) {
    return this.usageService.updateUserSettings(body)
  }
}
