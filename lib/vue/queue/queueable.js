export default class Queueable {
    constructor(name) {
        this.name = name;
        this.setupProcess();
    }
    
    setupProcess() {
        global.queue.process(this.name, async(job, done) => {
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
            const tmpQueue = global.queue.create(this.name, data)
                .priority(this.priority || 'normal')
                .attempts(this.attempts || 1)
                .removeOnComplete(this.removeOnComplete || true);
            
            if (this.delay) {
                tmpQueue.delay(this.delay);
            }

            if(this.backoff) {
                tmpQueue.backoff(this.backoff);
            }
            
            const job = await tmpQueue.save();

            return job;
        } catch(err) {
            throw err;
        }
    }
}
