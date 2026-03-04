import { Body, Controller, Get, Post, Query, Req, UnauthorizedException } from '@nestjs/common'
import { UsageService } from './usage.service'
import { CreateUsageDto } from './dto/create-usage.dto'
import type { EntityType } from './dto/create-usage.dto'
import { AuthService } from '../auth/auth.service'

@Controller('usage')
export class UsageController {
  constructor(
    private readonly usageService: UsageService,
    private readonly authService: AuthService,
  ) {}

  private async extractUserId(req: any): Promise<number> {
    const authHeader: string = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    const user = await this.authService.validateToken(token)
    if (!user) {
      throw new UnauthorizedException('Invalid token')
    }
    return Number(user.id)
  }

  @Get('dashboard')
  async getDashboard(@Req() req: any, @Query('entityType') entityType?: EntityType) {
    const userId = await this.extractUserId(req)
    return this.usageService.findDashboard(userId, entityType || 'home')
  }

  @Post()
  async createEntry(@Req() req: any, @Body() dto: CreateUsageDto) {
    const userId = await this.extractUserId(req)
    return this.usageService.create(dto, userId)
  }

  @Get('history')
  async getHistory(@Req() req: any) {
    const userId = await this.extractUserId(req)
    return this.usageService.findHistory(userId)
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
  async getUserSettings(@Req() req: any) {
    const userId = await this.extractUserId(req)
    return this.usageService.getUserSettings(userId)
  }

  @Post('settings')
  async updateUserSettings(@Req() req: any, @Body() body: any) {
    const userId = await this.extractUserId(req)
    return this.usageService.updateUserSettings(userId, body)
  }

  @Get('alerts')
  async getAlerts(@Req() req: any) {
    const userId = await this.extractUserId(req)
    return this.usageService.getAlerts(userId)
  }

  @Get('reports')
  async getReports(@Req() req: any) {
    const userId = await this.extractUserId(req)
    return this.usageService.getReports(userId)
  }
}
