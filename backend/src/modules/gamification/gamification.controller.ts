import { Controller, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('gamification')
@Controller('gamification')
export class GamificationController {
    constructor(private readonly gamificationService: GamificationService) { }

    @Get('leaderboard')
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getLeaderboard(@Query('limit') limit?: string) {
        return this.gamificationService.getLeaderboard(limit ? parseInt(limit, 10) : 10);
    }

    @Get('stats')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    getMyStats(@Request() req: any) {
        return this.gamificationService.getUserStats(req.user.userId);
    }

    @Get('stats/:userId')
    getUserStats(@Param('userId') userId: string) {
        return this.gamificationService.getUserStats(userId);
    }
}
