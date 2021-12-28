export class SettingsDto {
  readonly email: string

  constructor(object: any) {
    object = object || {}
    this.email = object.email
  }
}
