import Queue from './queue';

export default class Queueable {
  constructor(name) {
    if (!Queue) throw new Error('In order to use Queues, check that redis is running and the env variables are set.');

    this.name = name;
    this.setupProcess();
  }
    
  setupProcess() {
    for (const worker of Queue.workers) {
      if (worker.type === this.name && worker.running) {
        worker.shutdown(1000);
      }
    }

    Queue.process(this.name, async(job, done) => {
      try {
        const response = await this.handle(job);
        done(null, response);
      } catch (err) {
        done(err);
      }
    });
  }

  async dispatch(data) {
    try {
      const tmpQueue = Queue.create(this.name, data)
                .priority(this.priority || 'normal')
                .attempts(this.attempts || 1)
                .removeOnComplete(this.removeOnComplete || true);
            
      if (this.delay) {
        tmpQueue.delay(this.delay);
      }

      if (this.backoff) {
        tmpQueue.backoff(this.backoff);
      }
            
      const job = await tmpQueue.save();

      return job;
    } catch (err) {
      throw err;
    }
  }
}
