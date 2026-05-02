import { Log } from 'logging_middleware';
import axios from 'axios';

const API_URL = 'http://20.207.122.201/evaluation-service/notifications';
export const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhcmp1bmF3YXN0aGlfYXJqdW5Ac3JtYXAuZWR1LmluIiwiZXhwIjoxNzc3NzA1Mjg5LCJpYXQiOjE3Nzc3MDQzODksImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI5MmY1ZmUxNS00YmU0LTQ2NzAtYjliNy1hMDJhZjQxZmJhYTQiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJhcmp1biBhd2FzdGhpIiwic3ViIjoiMTk3ODI0OTQtY2I2My00ZWMwLTg4NTEtYTE0ZTRjYWI0ODg0In0sImVtYWlsIjoiYXJqdW5hd2FzdGhpX2FyanVuQHNybWFwLmVkdS5pbiIsIm5hbWUiOiJhcmp1biBhd2FzdGhpIiwicm9sbE5vIjoiYXAyMzExMDAxMDcwNiIsImFjY2Vzc0NvZGUiOiJRa2JweEgiLCJjbGllbnRJRCI6IjE5NzgyNDk0LWNiNjMtNGVjMC04ODUxLWExNGU0Y2FiNDg4NCIsImNsaWVudFNlY3JldCI6InlZTVp1RldGclRKQlVkQXQifQ.mRYaPKWTD2GSd9RR5IHA32Dl-RlSmcMvQ-Zd94s7WHY';

const getMockData = () => {
    return [
        { id: 1, type: 'Event', message: 'Annual Sports Day', timestamp: new Date(Date.now() - 100000).toISOString() },
        { id: 2, type: 'Placement', message: 'Google Campus Drive', timestamp: new Date(Date.now() - 50000).toISOString() },
        { id: 3, type: 'Result', message: 'Semester 6 Results Declared', timestamp: new Date().toISOString() },
        { id: 4, type: 'Event', message: 'Cultural Fest', timestamp: new Date().toISOString() },
        { id: 5, type: 'Placement', message: 'Microsoft Interviews', timestamp: new Date(Date.now() - 10000).toISOString() },
    ];
};

export const fetchNotifications = async () => {
    await Log('backend', 'debug', 'service', 'Executing fetchNotifications');
    await Log('backend', 'info', 'route', `Dispatching GET to ${API_URL}`);
    
    try {
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`
            }
        });
        await Log('backend', 'info', 'route', `Received successful response with status ${response.status}`);
        const rawData = response.data?.notifications || response.data?.data || response.data || [];
        const mappedData = Array.isArray(rawData) ? rawData.map(item => ({
            id: item.ID || item.id,
            type: item.Type || item.type,
            message: item.Message || item.message,
            timestamp: item.Timestamp || item.timestamp
        })) : [];
        return mappedData;
    } catch (error) {
        await Log('backend', 'error', 'route', `External API failure: ${error.message}`);
        return getMockData();
    }
};

const getPriorityScore = (type) => {
    switch (type) {
        case 'Placement': return 3;
        case 'Result': return 2;
        case 'Event': return 1;
        default: return 0;
    }
};

export const sortByPriority = (notifications) => {
    Log('backend', 'debug', 'service', 'Executing sortByPriority');
    
    return [...notifications].sort((a, b) => {
        const priorityA = getPriorityScore(a.type);
        const priorityB = getPriorityScore(b.type);
        
        if (priorityA !== priorityB) {
            return priorityB - priorityA; 
        }
        
        return new Date(b.timestamp) - new Date(a.timestamp); 
    });
};

const comparePriority = (a, b) => {
    const priorityA = getPriorityScore(a.type);
    const priorityB = getPriorityScore(b.type);
    if (priorityA !== priorityB) {
        return priorityB - priorityA; 
    }
    return new Date(b.timestamp) - new Date(a.timestamp); 
};

export const getTopNotifications = (notifications, n) => {
    Log('backend', 'debug', 'service', 'Executing getTopNotifications with min-heap');
    
    if (!notifications || notifications.length === 0) return [];
    if (n >= notifications.length) return sortByPriority(notifications);
    
    const heap = [];
    
    const swap = (i, j) => {
        const temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;
    };
    
    const heapifyUp = (index) => {
        let current = index;
        while (current > 0) {
            let parent = Math.floor((current - 1) / 2);
            if (comparePriority(heap[current], heap[parent]) > 0) {
                swap(current, parent);
                current = parent;
            } else {
                break;
            }
        }
    };
    
    const heapifyDown = (index) => {
        let current = index;
        const length = heap.length;
        while (true) {
            let left = 2 * current + 1;
            let right = 2 * current + 2;
            let smallest = current;
            
            if (left < length && comparePriority(heap[left], heap[smallest]) > 0) {
                smallest = left;
            }
            if (right < length && comparePriority(heap[right], heap[smallest]) > 0) {
                smallest = right;
            }
            if (smallest !== current) {
                swap(current, smallest);
                current = smallest;
            } else {
                break;
            }
        }
    };
    
    for (const notif of notifications) {
        if (heap.length < n) {
            heap.push(notif);
            heapifyUp(heap.length - 1);
        } else {
            if (comparePriority(notif, heap[0]) < 0) {
                heap[0] = notif;
                heapifyDown(0);
            }
        }
    }
    
    return heap.sort(comparePriority);
};
