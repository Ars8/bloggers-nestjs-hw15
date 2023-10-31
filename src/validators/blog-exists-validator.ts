import { Inject, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IBlogsRepository } from '../blogs/blogs.repository';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsValidator implements ValidatorConstraintInterface {
  constructor(
    @Inject('IBlogsRepository') protected blogsRepository: IBlogsRepository,
  ) {}

  async validate(id: string) {
    //console.log(id);
    try {
      const blog = await this.blogsRepository.findOne(id);
      // console.log(blog);
      if (!blog) return false;
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "Blog doesn't exist";
  }
}
