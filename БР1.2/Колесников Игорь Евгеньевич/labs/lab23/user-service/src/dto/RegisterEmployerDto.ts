import { IsEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterEmployerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsEmpty({ message: 'Company is assigned when it is created' })
  companyId?: string;
}
