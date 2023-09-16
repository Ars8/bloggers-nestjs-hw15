import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashManager } from '../managers/hashManager';
import { UsersRepository } from './users.repository';
import { OutputUserDto } from './dto/output-user.dto';
import { QueryType } from '../helpers/queryHandler';
import { PaginationViewType } from '../helpers/transformToPaginationView';

@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    protected hashManager: HashManager,
  ) {}
  async create(
    createUserDto: CreateUserDto,
    confirmed?: true,
    confirmationCode?: string,
  ): Promise<OutputUserDto> {
    createUserDto.password = await this.hashManager.generateHash(
      createUserDto.password,
    );
    return await this.usersRepository.create(
      createUserDto,
      confirmed,
      confirmationCode,
    );
  }

  findAll(query: QueryType): Promise<PaginationViewType<OutputUserDto>> {
    return this.usersRepository.findAll(query);
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string): Promise<boolean> {
    return this.usersRepository.remove(id);
  }
}
