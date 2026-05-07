import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    message: 'Le mot de passe doit faire au moins 6 caractères.',
  })
  password: string;
}
