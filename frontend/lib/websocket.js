'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket() {
    const [connected, setConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState(null);
    const wsRef = useRef(null);
    const listenersRef = useRef(new Map());
    const reconnectTimeout = useRef(null);

    const connect = useCallback(() => {
        const url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';
        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                setConnected(true);
                console.log('🟢 WebSocket connected');
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    setLastEvent(message);

                    // Notify listeners
                    const typeListeners = listenersRef.current.get(message.type) || [];
                    typeListeners.forEach(cb => cb(message.data));

                    // Notify wildcard listeners
                    const wildcardListeners = listenersRef.current.get('*') || [];
                    wildcardListeners.forEach(cb => cb(message));
                } catch {
                    // Ignore
                }
            };

            ws.onclose = () => {
                setConnected(false);
                console.log('🔴 WebSocket disconnected, reconnecting...');
                reconnectTimeout.current = setTimeout(connect, 3000);
            };

            ws.onerror = () => {
                ws.close();
            };
        } catch {
            reconnectTimeout.current = setTimeout(connect, 3000);
        }
    }, []);

    useEffect(() => {
        connect();
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        };
    }, [connect]);

    const subscribe = useCallback((eventType, callback) => {
        if (!listenersRef.current.has(eventType)) {
            listenersRef.current.set(eventType, []);
        }
        listenersRef.current.get(eventType).push(callback);

        return () => {
            const listeners = listenersRef.current.get(eventType) || [];
            listenersRef.current.set(eventType, listeners.filter(cb => cb !== callback));
        };
    }, []);

    return { connected, lastEvent, subscribe };
}
