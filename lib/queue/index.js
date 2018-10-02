import kue from 'kue';

export default class Queue {
    constructor() {
        this.queue = kue.createQueue({
            redis: {
                port: process.env.REDIS_PORT,
                host: process.env.REDIS_HOST,
                auth: process.env.REDIS_PASSWORD,
                options: {
                    no_ready_check: false
                }
            }
        });

        this.configQueue();

        return this.queue;
    }

    configQueue() {
        this.queue.watchStuckJobs(1000 * 10);

        this.queue.on('ready', () => {
            console.info('Queue is ready!');
        });
          
        this.queue.on('error', (err) => {
            console.error('There was an error in the main queue!');
            console.error(err);
            console.error(err.stack);
        });
    }

    static getQueue() {
        return this.queue;
    }
}
