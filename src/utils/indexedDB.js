const DB_NAME = 'AttendanceTrackingDB';
const DB_VERSION = 1;
const STORE_NAME = 'attendanceData';

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

export const saveAttendanceData = async (data) => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await store.put({ id: 'attendance', data });

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.error('Error saving attendance data:', error);
        throw error;
    }
};

export const loadAttendanceData = async () => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.get('attendance');

            request.onsuccess = () => {
                const result = request?.result;
                resolve(result ? result.data : {});
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error loading attendance data:', error);
        return {};
    }
};

export const clearAttendanceData = async () => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await store.delete('attendance');

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.error('Error clearing attendance data:', error);
        throw error;
    }
};