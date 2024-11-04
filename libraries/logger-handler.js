'use strict';

/**
 * @name logger-handler
 * @author Riza Dwi Arifiyanto
 * @version 1.0.0
 * @description handling logger
 */

const winston = require('winston');
require('winston-daily-rotate-file');


module.exports = {
    init: (nodeEnv, logDir) => {
        // Transport for rotating log files
        const fileTransport = new (winston.transports.DailyRotateFile)({
            filename: `${logDir}/app-%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m',  // Log file will rotate when it reaches 10MB
            maxFiles: '14d'  // Keep logs for the last 14 days
        });

        // Transport for console logging
        const consoleTransport = new winston.transports.Console({
            format: winston.format.combine(
            winston.format.colorize(),  // Colorize output for better readability in the console
            winston.format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level}]: ${message}`;
            })
            )
        });
        
        // Different log levels for development and production
        const logger = winston.createLogger({
            level: nodeEnv === 'development' ? 'debug' : 'info',  // Use 'debug' in development, 'info' in production
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level}]: ${message}`;
                })
            ),
            transports: [
                fileTransport,
                consoleTransport   // Add console transport for simultaneous logging
            ],
            exceptionHandlers: [
                new winston.transports.File({ filename: `${logDir}/exceptions.log` }),
                consoleTransport   // Log exceptions to both file and console
            ],
            rejectionHandlers: [
                new winston.transports.File({ filename: `${logDir}/rejections.log` }),
                consoleTransport   // Log rejections to both file and console
            ]
        });

        return logger;
    }
}