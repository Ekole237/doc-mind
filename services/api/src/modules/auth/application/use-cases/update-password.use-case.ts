import { UpdatePasswordDto } from '#auth/application/dto/update-password.dto';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '#auth/domain/repositories/user.repository';
import {
  PASSWORD_SERVICE,
  type PasswordService,
} from '#auth/domain/services/password.service';
import { Password } from '#auth/domain/values-objects/password.vo';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UpdatePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: PasswordService,
  ) {}

  async execute(userId: string, dto: UpdatePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const hashedPassword = await this.passwordService.hash(dto.password);
    const passwordVO = Password.fromHashed(hashedPassword)!;

    const updatedUser = user.updatePassword(passwordVO);

    await this.userRepository.save(updatedUser);
  }
}
