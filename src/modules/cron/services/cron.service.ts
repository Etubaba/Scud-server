import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class CronService {
    constructor(private schedulerRegistry: SchedulerRegistry) {}

    async addJob(
        name: string,
        date: Date,
        onTick: () => void,
        onComplete?: () => void,
    ) {
        const job = new CronJob(date, onTick, onComplete);
        this.schedulerRegistry.addCronJob(name, job);
        job.start();
    }
    getJobs() {
        const jobs = this.schedulerRegistry.getCronJobs();
        const keys = Object.keys(jobs);
        return keys.map((key) => jobs.get(key));
    }

    deleteJob(name: string) {
        this.schedulerRegistry.deleteCronJob(name);
    }
}
