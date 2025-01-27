import { create } from "zustand";
import { compute, computed } from "zustand-computed-state";
export type Status = 'incomplete' | 'completed' | 'failed'
export type Transaction = {
    sender: string,
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
    allTransactions: Transaction[],
    filter?: string,
    total: number,
    setFilter: (a: string) => void,
    addTransaction: (a: Transaction) => void,
    setTransactions: (a: Transaction[]) => void,
}

const useTransactionsStore = create<TransactionsStore>(computed((set, get) => ({
    transactions: new Map<string, Transaction>(),
    filter: '',
    setFilter: (status) => set((state) => ({ ...state, status })),
    addTransaction: (a: Transaction) => set((state) => {
        const transactions = state.transactions;
        transactions.set(a.sessionId, a)
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
    ...compute(get, state => {
        const transactions = Array.from(state.transactions.values()).sort((a, b) => b.notificationTime.localeCompare(a.notificationTime));
        return {
            total: state.transactions.size,
            allTransactions: (state.filter?.length)? transactions.filter(item=>item.status === state.filter) : transactions,
        }
    })
})))

export default useTransactionsStore;