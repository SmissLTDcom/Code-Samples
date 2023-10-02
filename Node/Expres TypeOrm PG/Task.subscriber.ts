import { EventSubscriber, EntitySubscriberInterface, UpdateEvent } from 'typeorm';
import { Task } from '../entities';

@EventSubscriber()
export class TaskSubscriber implements EntitySubscriberInterface {
    listenTo() {
        return Task;
    }

    async beforeUpdate(event: UpdateEvent<Task>) {
        const { databaseEntity, entity } = event;

        if (entity.isArchived && !databaseEntity.isArchived) 
            entity.archivedAt = new Date();
    }

    async beforeInsert(event: UpdateEvent<Task>) {
        const { entity } = event;

        if (entity.isArchived && !entity.archivedAt)
            entity.archivedAt = new Date();
    }
}
