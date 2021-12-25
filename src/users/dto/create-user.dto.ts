import { IsNotEmpty, IsString, Matches, IsEmail, MinLength, MaxLength, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/[a-zA-Z0-9_-]{2,20}/, {
    message: 'Invalid first name provided',
  })
  firstName: string;

  @IsString()
  @Matches(/[a-zA-Z0-9_-]{2,20}/, {
    message: 'Invalid last name provided',
  })
  lastName: string;
  
  @IsNotEmpty()
  @IsEmail({ message: 'Invalid email provided'})
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(60)
  password: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/[0-9]{10}/, {
    message: 'Invalid phone number provided',
  })
  phoneNumber: string;
}
