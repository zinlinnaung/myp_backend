import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthUserDto, UpdateAuthUserDto } from './dto/auth.dto';

@Controller('users')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    return this.service.login(body.email, body.password);
  }

  @Get('me/:id')
  async getMe(@Param('id') id: string) {
    if (!id || id === 'undefined') {
      throw new UnauthorizedException('User ID is required');
    }
    return this.service.findUserById(id);
  }

  // --- Standard CRUD (Optional: can move to @Controller('users')) ---

  @Post()
  create(@Body() dto: CreateAuthUserDto) {
    return this.service.createUser(dto);
  }

  @Get()
  findAll() {
    return this.service.findAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findUserById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAuthUserDto) {
    return this.service.updateUser(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.removeUser(id);
  }
}
