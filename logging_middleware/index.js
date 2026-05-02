import axios from 'axios';

// The access token will be injected here once you generate it
let ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhcmp1bmF3YXN0aGlfYXJqdW5Ac3JtYXAuZWR1LmluIiwiZXhwIjoxNzc3NzA1Mjg5LCJpYXQiOjE3Nzc3MDQzODksImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI5MmY1ZmUxNS00YmU0LTQ2NzAtYjliNy1hMDJhZjQxZmJhYTQiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJhcmp1biBhd2FzdGhpIiwic3ViIjoiMTk3ODI0OTQtY2I2My00ZWMwLTg4NTEtYTE0ZTRjYWI0ODg0In0sImVtYWlsIjoiYXJqdW5hd2FzdGhpX2FyanVuQHNybWFwLmVkdS5pbiIsIm5hbWUiOiJhcmp1biBhd2FzdGhpIiwicm9sbE5vIjoiYXAyMzExMDAxMDcwNiIsImFjY2Vzc0NvZGUiOiJRa2JweEgiLCJjbGllbnRJRCI6IjE5NzgyNDk0LWNiNjMtNGVjMC04ODUxLWExNGU0Y2FiNDg4NCIsImNsaWVudFNlY3JldCI6InlZTVp1RldGclRKQlVkQXQifQ.mRYaPKWTD2GSd9RR5IHA32Dl-RlSmcMvQ-Zd94s7WHY';

export const setLogAccessToken = (token) => {
    ACCESS_TOKEN = token;
};

const VALID_STACKS = ['backend', 'frontend'];
const VALID_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const VALID_BE_PACKAGES = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];
const VALID_FE_PACKAGES = ['api', 'component', 'hook', 'page', 'state'];

/**
 * Core logging function
 * @param {string} stack - 'backend' or 'frontend'
 * @param {string} level - 'debug', 'info', 'warn', 'error', 'fatal'
 * @param {string} pkg - valid package string based on stack
 * @param {string} message - descriptive log message
 */
export const Log = async (stack, level, pkg, message) => {
    // 1. Validate against allowed enum values
    if (!VALID_STACKS.includes(stack)) {
        console.error(`Invalid stack: ${stack}`);
        return;
    }
    if (!VALID_LEVELS.includes(level)) {
        console.error(`Invalid level: ${level}`);
        return;
    }

    if (stack === 'backend' && !VALID_BE_PACKAGES.includes(pkg)) {
        console.error(`Invalid backend package: ${pkg}`);
        return;
    }
    
    if (stack === 'frontend' && !VALID_FE_PACKAGES.includes(pkg)) {
        console.error(`Invalid frontend package: ${pkg}`);
        return;
    }

    // 2. Format the payload
    const payload = {
        stack,
        level,
        package: pkg,
        message
    };

    // 3. Execute asynchronous POST request to the Log API
    try {
        await axios.post('http://20.207.122.201/evaluation-service/logs', payload, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`
            }
        });
        // Also log locally for development visibility
        console.info(`[${level.toUpperCase()}] ${message}`);
    } catch (error) {
        // 4. Handle errors silently to prevent application crashes
        console.error('Failed to send log to external service', error.message);
    }
};
