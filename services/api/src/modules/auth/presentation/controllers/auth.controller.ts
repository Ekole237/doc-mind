import { ActiveGuestTokenDto } from '#auth/application/dto/active-guest-token.dto';
import { ActiveMagicLinkDto } from '#auth/application/dto/active-magic-link.dto';
import { LoginWithEmailAndPasswordDto } from '#auth/application/dto/login-with-email-and-password.dto';
import { LoginWithProviderDto } from '#auth/application/dto/login-with-provider.dto';
import { RequestMagicLinkDto } from '#auth/application/dto/request-magic-link.dto';
import { UpdatePasswordDto } from '#auth/application/dto/update-password.dto';
import { ActiveGuestTokenUseCase } from '#auth/application/use-cases/active-guest-token.use-case';
import { ActivateMagicLinkUseCase } from '#auth/application/use-cases/active-magic-link.use-case';
import { LoginWithEmailAndPasswordUseCase } from '#auth/application/use-cases/login-with-email-and-password.use-case';
import { LoginWithProviderUseCase } from '#auth/application/use-cases/login-with-provider.use-case';
import { RequestMagicLinkUseCase } from '#auth/application/use-cases/request-magic-link.use-case';
import { UpdatePasswordUseCase } from '#auth/application/use-cases/update-password.use-case';
import { Role } from '#auth/domain/enums/role';
import {
  PROVIDER_SERVICE,
  type ProviderService,
} from '#auth/domain/services/provider.service';
import { JwtPayload } from '#auth/domain/services/token.service';
import { Roles } from '#auth/presentation/decorators/roles.decorator';
import { JwtGuard } from '#auth/presentation/guards/jwt.guard';
import { RbacGuard } from '#auth/presentation/guards/rbac.guard';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Put,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('auth')
export class AuthController {
  private readonly _frontendUrl: string;
  private readonly _isProduction: boolean;

  constructor(
    private readonly _loginWithEmailAndPasswordUseCase: LoginWithEmailAndPasswordUseCase,
    private readonly _loginWithProviderUseCase: LoginWithProviderUseCase,
    private readonly _activeGuestTokenUseCase: ActiveGuestTokenUseCase,
    private readonly _requestMagicLinkUseCase: RequestMagicLinkUseCase,
    private readonly _activateMagicLinkUseCase: ActivateMagicLinkUseCase,
    private readonly _updatePasswordUseCase: UpdatePasswordUseCase,
    @Inject(PROVIDER_SERVICE)
    private readonly _providerService: ProviderService,
    private readonly _configService: ConfigService,
  ) {
    this._frontendUrl = this._configService.getOrThrow<string>('FRONTEND_URL');
    this._isProduction =
      this._configService.get<string>('NODE_ENV') === 'production';
  }

  private _setAccessCookie(res: FastifyReply, token: string) {
    // Sécurité: le JWT n'est plus exposé au JS front via localStorage.
    res.setCookie('access_token', token, {
      httpOnly: true,
      secure: this._isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });
  }

  private _clearAccessCookie(res: FastifyReply) {
    res.clearCookie('access_token', {
      path: '/',
      sameSite: 'lax',
      secure: this._isProduction,
    });
  }

  private _readJwtPayload(token: string): JwtPayload | null {
    try {
      const [, payloadBase64] = token.split('.');
      if (!payloadBase64) return null;
      const payload = Buffer.from(payloadBase64, 'base64url').toString('utf8');
      return JSON.parse(payload) as JwtPayload;
    } catch {
      return null;
    }
  }

  private _toPublicUser(payload: JwtPayload) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      role_level: payload.role_level,
      is_guest: payload.is_guest,
    };
  }

  // ─── PROFILE ───────────────────────────────────────────────────────────────

  @Put('profile/password')
  @UseGuards(JwtGuard, RbacGuard)
  @Roles(Role.ADMIN)
  async updatePassword(
    @Req() req: FastifyRequest & { user: JwtPayload },
    @Body() dto: UpdatePasswordDto,
  ) {
    await this._updatePasswordUseCase.execute(req.user.sub, dto);
    return { message: 'Mot de passe mis à jour avec succès' };
  }

  // ─── EMPLOYEE (ZOHO) ────────────────────────────────────────────────────────

  @Get('zoho')
  @Redirect()
  zoho() {
    return {
      url: this._providerService.getAuthorizationUrl(),
      statusCode: 302,
    };
  }

  @Get('zoho/callback')
  @Throttle({ default: { ttl: 60 * 1000, limit: 10 } })
  async zohoCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Query('accounts-server') accountsServer: string | undefined,
    @Res() res: FastifyReply,
  ) {
    if (error === 'access_denied') {
      return res.redirect(`${this._frontendUrl}/login?error=cancelled`, 302);
    }
    if (error === 'server') {
      return res.redirect(`${this._frontendUrl}/login?error=server`, 302);
    }

    try {
      const dto: LoginWithProviderDto = { code };
      const token = await this._loginWithProviderUseCase.execute(
        dto,
        accountsServer,
      );
      this._setAccessCookie(res, token);
      // Sécurité: plus de token en query string lors du callback OAuth.
      return res.redirect(`${this._frontendUrl}/auth/callback`, 302);
    } catch (err) {
      console.error('Zoho OAuth error:', err);
      return res.redirect(`${this._frontendUrl}/login?error=server`, 302);
    }
  }

  // ─── ADMIN (email/password) ──────────────────────────────────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 15 * 60 * 1000, limit: 5 } })
  async login(
    @Body() dto: LoginWithEmailAndPasswordDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const token = await this._loginWithEmailAndPasswordUseCase.execute(dto);
    this._setAccessCookie(res, token);

    const payload = this._readJwtPayload(token);
    if (!payload) {
      this._clearAccessCookie(res);
      return { user: null };
    }

    return {
      user: this._toPublicUser(payload),
    };
  }

  @Get('session')
  @UseGuards(JwtGuard)
  @Throttle({ default: { ttl: 60 * 1000, limit: 30 } })
  getSession(@Req() req: FastifyRequest & { user: JwtPayload }) {
    return {
      user: {
        sub: req.user.sub,
        email: req.user.email,
        role: req.user.role,
        role_level: req.user.role_level,
        is_guest: req.user.is_guest,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: FastifyReply) {
    this._clearAccessCookie(res);
    return { loggedOut: true };
  }

  // ─── GUEST (première connexion via QR code) ──────────────────────────────────

  @Get('guest/activate')
  async activateGuestToken(
    @Query() dto: ActiveGuestTokenDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const token = await this._activeGuestTokenUseCase.execute(dto);
    this._setAccessCookie(res, token);

    const payload = this._readJwtPayload(token);
    if (!payload) {
      this._clearAccessCookie(res);
      return { user: null };
    }

    return { user: this._toPublicUser(payload) };
  }

  // ─── GUEST (connexions suivantes via magic link) ──────────────────────────────

  @Post('guest/magic-link')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60 * 1000, limit: 3 } })
  async requestMagicLink(@Body() dto: RequestMagicLinkDto) {
    await this._requestMagicLinkUseCase.execute(dto);
    return {
      message:
        'Si cet email est associé à un accès actif, un lien vous a été envoyé. Vérifiez votre boite mail.',
    };
  }

  @Get('guest/magic-link/activate')
  async activateMagicLink(
    @Query() dto: ActiveMagicLinkDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const token = await this._activateMagicLinkUseCase.execute(dto);
    this._setAccessCookie(res, token);

    const payload = this._readJwtPayload(token);
    if (!payload) {
      this._clearAccessCookie(res);
      return { user: null };
    }

    return { user: this._toPublicUser(payload) };
  }
}
