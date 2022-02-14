import { createApp } from './app';

async function main() {
  const app = await createApp();
  await app.listen(process.env.SERVER_PORT);
}

main();
