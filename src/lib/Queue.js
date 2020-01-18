import Bee from 'bee-queue';
import redisConfig from '../config/redis';
import CancellationMail from '../app/jobs/CancellationMail';

const jobs = [CancellationMail];

class Queue {
    constructor() {
        this.queues = {};

        this.init();
    }

    init() {
        jobs.forEach(({ key, handle }) => {
            this.queues[key] = {
                queue: new Bee(key, {
                    redis: redisConfig,
                }),
                handle,
            };
        });
    }

    add(queue, job) {
        return this.queues[queue].queue.createJobs(job).save();
    }

    processQueue() {
        jobs.forEach(job => {
            const { queue, handle } = this.queues[job.key];

            queue.on('Failed', this.handleFailed).process(handle);
        });
    }

    handleFailed(job, err) {
        console.log(job, err);
    }
}

export default new Queue();
