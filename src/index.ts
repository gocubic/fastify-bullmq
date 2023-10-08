import { Server, IncomingMessage, ServerResponse } from 'http';
import fastify, { FastifyInstance } from 'fastify';
import { ConnectionOptions, Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import { env } from './env';

interface AddJobQueryString {
  id: string;
  email: string;
}

const connection: ConnectionOptions = {
  host: env.REDISHOST,
  port: env.REDISPORT,
  username: env.REDISUSER,
  password: env.REDISPASSWORD,
};

const run = async () => {
  const processorsName: string[] = [
    'activities-producer',
    'shipment-workflows',
    'integrations',
  ];

  const queues = processorsName.map(
    (name) => new Queue(`api:${name}`, { connection })
  );

  const server: FastifyInstance<Server, IncomingMessage, ServerResponse> =
    fastify();

  const serverAdapter = new FastifyAdapter();
  createBullBoard({
    queues: queues.map((queue) => new BullMQAdapter(queue)),
    serverAdapter,
  });
  serverAdapter.setBasePath('/');
  server.register(serverAdapter.registerPlugin(), {
    prefix: '/',
    basePath: '/',
  });

  await server.listen({ port: env.PORT, host: '0.0.0.0' });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
