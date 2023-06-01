import { ConnectionOptions, Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
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

// Dont forget to add your new queue to the createBullBoard queues array
const run = async () => {
  const activitiesProducerQueue = new Queue('api:activities-producer', {
    connection,
  });
  const shipmentWorkflowsQueue = new Queue('api:shipment-workflows', {
    connection,
  });

  const server: FastifyInstance<Server, IncomingMessage, ServerResponse> =
    fastify();

  const serverAdapter = new FastifyAdapter();
  createBullBoard({
    queues: [
      new BullMQAdapter(activitiesProducerQueue),
      new BullMQAdapter(shipmentWorkflowsQueue),
    ],
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
