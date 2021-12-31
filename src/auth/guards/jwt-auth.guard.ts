import * as jwt from 'jsonwebtoken'
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, forwardRef } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Socket } from 'socket.io'
import { UsersService } from 'src/users/users.service'
import { Client, getClient } from 'src/common/utils/get-client'

export interface Token {
  id: string
  email: string
  roles: string[]
  exp: number
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  reflector: Reflector

  constructor(@Inject(forwardRef(() => UsersService)) private userService: UsersService) {
    this.reflector = new Reflector()
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const client = this.getRequest(ctx)
    const allowAny = this.reflector.get<boolean>('allow-any', ctx.getHandler())

    try {
      client.user = await this.handleRequest(ctx, client)
    } catch (e) {
      if (allowAny) {
        return true
      }

      throw e
    }

    return client.user != null
  }

  private async handleRequest(ctx: ExecutionContext, client: Client) {
    const token = this.getToken(ctx, client)
    const decodedToken = jwt.decode(token) as Token

    if (!decodedToken) {
      this.throwException(ctx, 'Unable to decode Authorization Token')
    }

    if (Date.now() >= decodedToken.exp * 1000) {
      this.throwException(ctx, 'Authorization token expired')
    }

    try {
      const user = await this.validate(decodedToken)

      // Verifying authorization token
      await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

      return user
    } catch (e) {
      this.throwException(ctx, 'Invalid Authorization token provided')
    }
  }

  private validate({ id }: Token) {
    return this.userService.validateUserById(id)
  }

  private getToken(ctx: ExecutionContext, client: Client): string {
    const authorization = client.headers.authorization?.split(' ')

    if (!authorization) {
      this.throwException(ctx, 'Token not found')
    }

    if (authorization[0].toLowerCase() !== 'bearer') {
      this.throwException(ctx, 'Authorization type not valid')
    }

    if (!authorization[1]) {
      this.throwException(ctx, 'Token not provided')
    }

    return authorization[1]
  }

  throwException(ctx: ExecutionContext, message: string) {
    if (ctx.getType() === 'ws') {
      ctx.switchToWs().getClient<Socket>().disconnect(true)
    }

    throw new UnauthorizedException(message)
  }

  private getRequest(ctx: ExecutionContext) {
    return getClient(ctx)
  }
}
