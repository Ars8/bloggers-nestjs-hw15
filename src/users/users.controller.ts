import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  NotFoundException,
  HttpCode,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { queryHandler } from '../helpers/queryHandler';
import { PaginationViewType } from '../helpers/transformToPaginationView';
import { OutputUserDto } from './dto/output-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(AuthGuard('basic'))
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto, true);
  }
  @UseGuards(AuthGuard('basic'))
  @Get()
  async findAll(@Query() query): Promise<PaginationViewType<OutputUserDto>> {
    return this.usersService.findAll(queryHandler(query));
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }
  //
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }
  @UseGuards(AuthGuard('basic'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<HttpStatus.NO_CONTENT> {
    const deletedUser = await this.usersService.remove(id);
    if (!deletedUser) throw new NotFoundException();
    return HttpStatus.NO_CONTENT;
  }
}
