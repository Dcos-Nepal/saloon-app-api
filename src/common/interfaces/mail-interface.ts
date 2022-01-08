export default interface IMail {
  sendEmail(to: string | string[], subject: string, html: string): Promise<IMailResponse>;
}

export interface IMailResponse {
  messageId: string;
}
