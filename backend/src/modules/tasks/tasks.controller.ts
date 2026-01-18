import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { StartTaskDto } from './dto/start-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
        return this.tasksService.create(createTaskDto, req.user.userId);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    findAll(@Request() req: any) {
        return this.tasksService.findAll(req.user.userId, req.user.role);
    }

    // Get user's active task with timer
    @Get('active')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    getActiveTask(@Request() req: any) {
        return this.tasksService.getActiveTask(req.user.userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.tasksService.update(id, updateTaskDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.tasksService.remove(id);
    }

    // ===== Timer Control Endpoints =====

    @Post(':id/start')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    startTask(@Param('id') id: string, @Body() startTaskDto: StartTaskDto, @Request() req: any) {
        return this.tasksService.startTask(id, req.user.userId, startTaskDto.durationSeconds);
    }

    @Post(':id/pause')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    pauseTask(@Param('id') id: string, @Request() req: any) {
        return this.tasksService.pauseTask(id, req.user.userId);
    }

    @Post(':id/resume')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    resumeTask(@Param('id') id: string, @Request() req: any) {
        return this.tasksService.resumeTask(id, req.user.userId);
    }

    @Post(':id/complete')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    completeTask(@Param('id') id: string, @Request() req: any) {
        return this.tasksService.completeTask(id, req.user.userId);
    }
}
