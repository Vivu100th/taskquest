import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmitTaskDto, ReviewTaskDto } from '../tasks/dto/submit-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    @Post('task/:taskId')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    submit(
        @Request() req: any,
        @Param('taskId') taskId: string,
        @Body() submitDto: SubmitTaskDto,
    ) {
        return this.submissionsService.submitTask(req.user.userId, taskId, submitDto);
    }

    @Get('my')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    getMySubmissions(@Request() req: any) {
        return this.submissionsService.getUserSubmissions(req.user.userId);
    }

    @Get('pending')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN', 'MODERATOR')
    @ApiBearerAuth()
    getPending() {
        return this.submissionsService.getPendingSubmissions();
    }

    @Post(':id/review')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN', 'MODERATOR')
    @ApiBearerAuth()
    review(
        @Request() req: any,
        @Param('id') id: string,
        @Body() reviewDto: ReviewTaskDto,
    ) {
        return this.submissionsService.reviewSubmission(id, reviewDto, req.user.userId);
    }
}
