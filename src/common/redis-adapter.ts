import { RedisClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { createAdapter } from 'socket.io-redis';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigService } from 'src/configs/config.service';

const config = new ConfigService();
const pubClient = new RedisClient({
  host: config.get('REDIS_HOST'),
  port: +config.get('REDIS_PORT')
});
const subClient = pubClient.duplicate();
const redisAdapter = createAdapter({ pubClient, subClient });

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(redisAdapter);
    return server;
  }
}

/**
 * ---- FOR FUTURE IMPLEMENTATION -----
 * Using @socket.io/redis-adapter library
 */

// const config = const config = new ConfigService();

// const { createClient } = require("redis");
// const { createAdapter } = require("@socket.io/redis-adapter");
// const pubClient = createClient({ host: config.get('REDIS_HOST'), port: parseInt(config.get('REDIS_PORT')) });
// const subClient = pubClient.duplicate();

// const redisAdapter = createAdapter(pubClient, subClient);

// export class RedisIoAdapter extends IoAdapter {
//   createIOServer(port: number, options?: ServerOptions): any {
//     const server = super.createIOServer(port, options);
//     server.adapter(redisAdapter as any);
//     return server;
//   }
// }
