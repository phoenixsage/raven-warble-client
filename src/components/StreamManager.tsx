import React, { ReactNode, useEffect, useRef, useState } from "react";
import useSocket from "../hooks/socketio";
import useTransactionsStore, { Transaction } from "../stores/tranactions";

type IProps = {
    children: ReactNode
}

const StreamManager: React.FC<IProps> = ({ children }) => {
    const { socket, connected, connect } = useSocket()
    const notifyAudio = useRef<HTMLAudioElement>(null)
    const [credentials, setStreamCredentials] = useState<{ acc: string | null, key: string | null }>({ acc: null, key: null })
    const [authError, setAuthError] = useState<string | null>(null)
    const [connecting, setConnecting] = useState(false)
    const streams = useTransactionsStore(state => state.allStreams)
    const setStreams = useTransactionsStore(state => state.addStream)
    const removeStream = useTransactionsStore(state => state.removeStream)
    const clearStreams = useTransactionsStore(state => state.removeStreams)
    const transactions = useTransactionsStore(state => state.allTransactions)
    const totalTransactions = useTransactionsStore(state => state.total)
    const addTransaction = useTransactionsStore(state => state.addTransaction)
    const addTransactions = useTransactionsStore(state => state.addTransactions)
    const setFilter = useTransactionsStore(state => state.setFilter)
    const filter = useTransactionsStore(state => state.filter)
    const possibleStatus = ['incomplete', 'complete', 'failed']


    const connectSocket = () => {
        setConnecting(true)
        setAuthError(null)
        const socket = connect({
            auth: async (cb) => {
                cb(credentials)
            }
        })

        socket.on(`new_transaction`, (data: Transaction) => {
            if (data.status === 'complete') {
                notifyUser(data)
            }
            addTransaction(data);
        })

        socket.on('connect_error', (err) => {
            setAuthError(err.message);
            setConnecting(false)
        })

        socket.on('connect', () => {
            setAuthError(null);
            setConnecting(false)
            setStreamCredentials({ acc: null, key: null })
        })

        socket.on('error', (message) => {
            setAuthError(message);
        })


        socket.on('stream-history', (data: any[]) => {
            addTransactions(data)
        })

        socket.on('new-active-stream', (data) => {
            setStreamCredentials({ acc: null, key: null })
            setStreams({ acc: data, connected: true })
            setConnecting(false)
        })

        socket.on('leave:room', (data) => {
            removeStream(data)
        })
    }

    const notifyUser = (data: Transaction) => {
        playSound();
        const title = `You received ${data.amount} from ${data.sender} | ${data.senderBank}`;
        const options = {
            body: data.narration,
            icon: '/logo.svg',
        };
        try {
            Notification.requestPermission().then((value) => {
                console.log(value)
                if (value !== 'granted') return;

                if (!('serviceWorker' in navigator)) {
                    new Notification(title, options)
                }

                navigator.serviceWorker.ready.then(
                    async (registration) => {
                        registration.showNotification(title, {
                            ...options,
                            //@ts-ignore
                            vibrate: [200, 100, 200, 100, 200, 100, 200],
                            tag: "new-transaction"
                        })

                    }
                )
            })
        } catch (error) {
            console.log(error)
        }

    }

    const playSound = () => {
        return notifyAudio.current?.play()
    }

    const addStream = () => {

        if (streams.length === 0) {
            setStreams({ acc: `${credentials.acc}`, connected: false })
            return connectSocket()
        }

        if (streams.findIndex(stream => stream.acc === credentials.acc) >= 0) {
            setConnecting(false)
            return setAuthError("Stream already exists")
        }

        setConnecting(true)
        setAuthError(null)
        socket?.emit('join:room', credentials)
        setStreams({ acc: `${credentials.acc}`, connected: false })
        setTimeout(() => clearInActiveStream(), 20000)
    }

    const clearInActiveStream = () => {
        console.log("clean up: ", streams)
        streams.forEach(stream => {
            if (stream.connected) return;
            removeStream(stream.acc)
        })
    }

    const cleanUpSocketConnection = () => {
        socket?.disconnect()
        clearStreams()
    }

    const disconnectStream = (acc: string) => {
        socket?.emit("leave:room", acc)
        setStreams({ acc, connected: false })
        clearInActiveStream()
    }

    const registerNotificaion = () => {

        if (!("Notification" in window)) return;

        if (["granted", "denied"].includes(Notification.permission)) return;

        Notification.requestPermission().then((value) => {
            if (value !== 'granted') {
                console.log("User rejected notification request")
            }
        }).catch(e => {
            console.log("Failed to acquire notificaion: ", e.message)
        })
    }

    useEffect(() => {
        const audio = new Audio("/notify.mp3")
        audio.addEventListener('canplaythrough', () => {

        }, false)
    }, [notifyAudio])

    return (<>
    <children {...children} />
    <audio ref={notifyAudio} src='/notify.mp3' />
    </>)
}

export default StreamManager;