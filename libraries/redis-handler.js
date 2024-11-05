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
    COUNTER_KEY: 'counter_key',
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
    },
    getCounter: async (redis) => {
        try {
            // Reset counter to 0
            return await redis.get(module.exports.COUNTER_KEY);
        } catch (err) {
            console.error('Error incrementing counter:', err);
        }
    },
    resetCounter: async (redis) => {
        try {
            // Reset counter to 0
            await redis.set(module.exports.COUNTER_KEY, 0);
        } catch (err) {
            console.error('Error incrementing counter:', err);
        }
    },
    incrementCounter: async (redis) => {
        try {
            // INCR to increment the counter key by 1
            const newValue = await redis.incr(module.exports.COUNTER_KEY);
            // console.log(`Counter incremented. New value: ${newValue}`);
            return newValue;
        } catch (err) {
            console.error('Error incrementing counter:', err);
        }
    },
    decrementCounter: async (redis) => {
        try {
            // DECR to decrement the counter key by 1
            const newValue = await redis.decr(module.exports.COUNTER_KEY);
            // console.log(`Counter decremented. New value: ${newValue}`);
            return newValue;
        } catch (err) {
            console.error('Error decrementing counter:', err);
        }
  }
}