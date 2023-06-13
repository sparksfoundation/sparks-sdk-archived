function createMockWindow(origin) {
    const eventListeners = new Map();

    const postMessage = (message, target) => {
        const event = { data: message, origin };
        if (eventListeners.has(target)) {
            eventListeners.get(target).forEach(listener => listener(event));
        }
    };

    const addEventListener = (eventName, listener) => {
        if (!eventListeners.has(origin)) {
            eventListeners.set(origin, new Map());
        }
        const listeners = eventListeners.get(origin);
        if (!listeners.has(eventName)) {
            listeners.set(eventName, []);
        }
        listeners.get(eventName).push(listener);
    };

    return {
        origin,
        postMessage,
        addEventListener,
    };
}

const mockWindows = new Map();

const windowProxy = new Proxy(global, {
    get(target, prop) {
        console.log(prop, 'hey')
        if (prop === 'window') {
            const context = global.origin || '';
            if (!mockWindows.has(context)) {
                mockWindows.set(context, createMockWindow(context));
            }
            return mockWindows.get(context);
        }
        console.log(prop)
        return target[prop];
    },
});

window = null;
global = windowProxy;

console.log(window)

class User {
    test() {
        console.log(window.origin);
    }

    send(target, message) {
        window.postMessage(message, target);
    }

    watch() {
        const logMessage = event => console.log(event.data);
        window.addEventListener('message', logMessage);
    }
}

const alice = new User();
alice.test(); // localhost:1000
alice.watch(); // watch for message on :1000

global.origin = 'localhost:2000';

const bob = new User();
bob.test(); // localhost:2000
bob.send('localhost:1000', 'data');
