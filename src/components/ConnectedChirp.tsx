import React from "react";
import { AnimatePresence, motion } from "motion/react"
type IProps = {
    stream: {acc: string, connected: boolean},
    disconnect: ()=> void
}

const ConnectedStream: React.FC<IProps> = ({stream, disconnect})=>{
    return (
        <AnimatePresence>
            <motion.article 
                className={`flex flex-row border-1  text-gray-200 space-x-2 text-xs backdrop-blur ${stream.connected?  "bg-gray-600 border-gray-600": "bg-gray-400 border-gray-400"} px-2 p-1 rounded relative overflow-hidden`}
                initial={{ opacity: 0, scale: 0,  translateX: -100 }}
                animate={{ opacity: 1, scale: 1, translateX: 0 }}
                exit={{ opacity: 0, scale: 0, translateX: 0 }}
                title={stream.connected? stream.acc : "Connecting"}
            >
                <span>Acc: {stream.acc}</span> 
                { stream.connected && 
                    <button 
                        className="text-white hover:cursor-pointer font-bold" 
                        title="Disconnect" onClick={disconnect}>
                        x
                    </button>
                }
            </motion.article>
        </AnimatePresence>
    )
}

export default ConnectedStream;