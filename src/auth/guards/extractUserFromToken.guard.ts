import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
@Injectable()
export class ExtractUserFromToken implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      return true;
    }

    try {
      const user = this.jwtService.verify(
        request.headers.authorization.split(' ')[1],
        { secret: '666' },
      );
      if (user) {
        request.user = { userId: user.sub, userLogin: user.userName };
        //console.log(user);
        return true;
      }
    } catch {
      return true;
    }
  }
}
