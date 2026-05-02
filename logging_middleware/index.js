import axios from 'axios';

// The access token will be injected here once you generate it
let ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';

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
