import { create } from "zustand";
import { compute, computed } from "zustand-computed-state";
export type Status = 'incomplete' | 'complete' | 'failed'
export type Transaction = {
    sender: string,
    senderAcc: string,
    senderBank: string,
    senderBankCode: string,
    sessionId: string,
    amount: number,
    narration: string,
    status: Status,
    accountName: string,
    accountNumber: string,
    transactionTime: string,
    notificationTime: string,
}

type TransactionsStore = {
    transactions: Map<string, Transaction>,
    streams: Map<string, {acc: string, connected: boolean}>,
    allTransactions: Transaction[],
    allStreams: {acc: string, connected: boolean}[],
    filter?: string,
    total: number,
    setFilter: (a: string) => void,
    addTransaction: (a: Transaction) => void,
    addTransactions: (a: Transaction[]) => void,
    setTransactions: (a: Transaction[]) => void,
    addStream: (a:{acc: string, connected: boolean})=>void
    removeStream: (a:string)=>void
    removeStreams: ()=>void
}

const useTransactionsStore = create<TransactionsStore>(computed((set, get) => ({
    transactions: new Map<string, Transaction>(),
    streams: new Map<string,{acc: string, connected: boolean}>(),
    filter: '',
    setFilter: (status) => set((state) => ({ ...state, filter: status })),
    addTransaction: (a: Transaction) => set((state) => {
        const transactions = state.transactions;
        transactions.set(a.sessionId, a)
        return { transactions }
    }),
    addTransactions: (trans: Transaction[] = [])=>set((state) => {
        const transactions = state.transactions;
        for (let index = 0; index < trans.length; index++) {
            const element = trans[index];
            transactions.set(element.sessionId, element)
        }
        return { transactions }
    }),
    setTransactions: (t: Transaction[] = []) => set((_) => {
        const transactions = new Map<string, Transaction>()
        for (let i = 0; i < t.length; i++) {
            const item = t[i];
            transactions.set(item.sessionId, item)
        }
        return { transactions }
    }),
    addStream: (stream: {acc: string, connected: boolean})=> set(({streams})=>{
        streams.set(stream.acc, stream)
        return { streams }
    }),
    removeStream: (acc: string)=>set(({streams})=>{
        streams.delete(acc)
        return {streams}
    }),
    removeStreams: ()=>set((_)=>({streams: new Map()})),
    ...compute(get, state => {
        const transactions = Array.from(state.transactions.values()).sort((a, b) => {
          const stampA =  Number( a.notificationTime);
          const stampB =  Number(b.notificationTime);
          return stampA > stampB? -1: stampB>stampA?1:0
        });
        return {
            total: state.transactions.size,
            allStreams: Array.from(state.streams.values()),
            allTransactions: (state.filter?.length)? transactions.filter(item=>item.status === state.filter) : transactions,
        }
    })
})))

export default useTransactionsStore;