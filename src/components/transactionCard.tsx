import React from "react";
import { Transaction } from "../stores/tranactions";
import { AnimatePresence, motion } from "motion/react"
type IProps = {
    transaction: Transaction
}

const currencyFormatter = Intl.NumberFormat('en-NG', { currency: "NGN", currencyDisplay: "code", currencySign: "accounting", style: "currency" })

const TransactionCard: React.FC<IProps> = ({ transaction }) => (
    <AnimatePresence>
        <motion.article 
            className="flex flex-col border-1 border-gray-200 backdrop-blur bg-white px-4 p-2 rounded relative overflow-hidden"
            initial={{ opacity: 0, scale: 0,  translateX: "-100" }}
            animate={{ opacity: 1, scale: 1, translateX: 0 }}
            exit={{ opacity: 0, scale: 0, translateX: 0 }}
            
        >
            <div className="grid grid-cols-3">
                <div className="flex flex-col">
                    <div><span className="font-bold text-gray-700 text-xs">From: </span>{transaction.sender}</div>
                    <div><span className="font-bold text-gray-700 text-xs">Bank: </span>{transaction.senderBank}</div>
                    <div><span className="font-bold text-gray-700 text-xs">SessionId: </span>{transaction.sessionId}</div>
                </div>
                <div>
                    <h3 className="font-medium text-xs">Narration:</h3>
                    {transaction.narration}
                </div>
                <div>

                </div>
            </div>

            <footer className="flex justify-between items-end">
                <span className="text-sm text-teal-600 font-medium">
                    {transaction.transactionTime}
                </span>
                <span className="text-sm font-bold text-teal-800">
                    {currencyFormatter.format(transaction.amount)}
                </span>
            </footer>
            <div className="absolute -right-16 rotate-45  bg-green-600 w-56  shadow top-5 text-center">
                <span className="text-white"> {transaction.status}</span>
            </div>
        </motion.article>
    </AnimatePresence>

);

export default TransactionCard;