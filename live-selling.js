'use strict';

/**
 * @name live-selling
 * @author Riza Dwi Arifiyanto
 * @version 1.0.0
 * @description live selling with chat poc
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const redisHandler = require('./libraries/redis-handler');
const loggerHandler = require('./libraries/logger-handler');

// Initialize Express and Socket.io
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
const nodeEnv = process.env.NODE_ENV || 'development';

// Configure log levels and log directory
const logDir = '/usr/src/app/logs';  // Mounted volume for logs
const logger = loggerHandler.init(nodeEnv, logDir);

// Log the current environment
logger.info(`Running in ${nodeEnv} mode`);

app.use(express.static('public'));

// Error handling middleware in Express
app.use((err, req, res, next) => {
  logger.error(`Express error: ${err.message}`);
  res.status(404).send('API not found');
});

// Initialize Redis client
const redis = redisHandler.init({
  port: redisPort,
  host: redisHost
});
let connections = redisHandler.getCounter(redis);

io.on('connection', async (socket) => {
  logger.info('New client connected');
  connections = await redisHandler.incrementCounter(redis);
  io.emit('connection_count', connections);
  
  socket.on('message', async (msg) => {
    logger.info(`Message received: ${msg}`);
    await redisHandler.enqueue(redis, msg);
    const msgs = await redisHandler.listQueue(redis);
    io.emit('chats', JSON.stringify(msgs));
  });

  socket.on('disconnect', async () => {
    logger.info('Client disconnected');
    connections = await redisHandler.decrementCounter(redis);
    io.emit('connection_count', connections);
  });
});

server.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

// Catch unhandled promise rejections globally
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Catch uncaught exceptions globally
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);  // Optional: exit the process for fatal errors
});
