import {
  IsNotEmpty,
  IsString,
} from 'class-validator'

export class CreateClientDto {

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsNotEmpty()
  service!: string

}