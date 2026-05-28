import {
  IsNotEmpty,
  IsString,
} from 'class-validator'

export class UpdateClientDto {

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsNotEmpty()
  service!: string

}