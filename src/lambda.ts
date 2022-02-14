import { configure } from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { createApp } from './app';

let server: Handler;

async function createHandler(): Promise<Handler> {
  const app = await createApp();
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return configure({ app: expressApp });
}

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  server = server ?? (await createHandler());
  return server(event, context, callback);
};
