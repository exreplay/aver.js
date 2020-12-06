import kue from 'kue';
import Redis from 'ioredis';

class Queue {
  constructor() {
    if (!process.env.REDIS_HOST) return;

    this.queue = kue.createQueue({
      redis: {
        createClientFactory: () =>
          new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST, {
            password: process.env.REDIS_PASSWORD
          })
      }
    });

    this.configQueue();
  }

  configQueue() {
    this.queue.watchStuckJobs(1000 * 10);

    this.queue.on('ready', () => {
      console.info('Queue is ready!');
    });

    this.queue.on('error', err => {
      console.error('There was an error in the main queue!');
      console.error(err);
      console.error(err.stack);
    });
  }
}

const queueObj = new Queue();
export default queueObj.queue;
