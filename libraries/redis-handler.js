'use strict';

/**
 * @name redis-handler
 * @author Riza Dwi Arifiyanto
 * @version 1.0.0
 * @description handling redis queue
 */

const Redis = require('ioredis');

module.exports = {
    QUEUE_KEY: 'fifo_queue',
    MAX_QUEUE: 10,
    init: (config) => {
        return new Redis(config);
    },
    enqueue: async (redis, item) => {
        try {
            await redis.lpush(module.exports.QUEUE_KEY, item);
            await redis.ltrim(module.exports.QUEUE_KEY, 0, module.exports.MAX_QUEUE - 1);
            // console.log(`Enqueued: ${item}`);
        } catch (err) {
            console.error('Error adding item to queue:', err);
        }
    },
    listQueue: async (redis) => {
        try {
            const items = await redis.lrange(module.exports.QUEUE_KEY, 0, -1);
            // console.log(`Queue : ${items}`);
            return items;
        } catch (err) {
            console.error('Error retrieving queue:', err);
        }
    }
}