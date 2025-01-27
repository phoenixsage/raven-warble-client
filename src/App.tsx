import { useEffect, useRef, useState } from 'react'
import './App.css'
import useSocket from './hooks/socketio'
import useTransactionsStore, { Transaction } from './stores/tranactions'
import TransactionCard from './components/transactionCard'


function App() {
  const { socket, connected, connect } = useSocket()
  const notifyAudio = useRef<HTMLAudioElement>(null)
  const [credentials, setWarbleCredentials] = useState<{ acc: string | null, key: string | null }>({ acc: null, key: null })
  const transactions = useTransactionsStore(state => state.allTransactions)
  const totalTransactions = useTransactionsStore(state => state.total)
  const addTransaction = useTransactionsStore(state => state.addTransaction)
  const setFilter = useTransactionsStore(state => state.setFilter)
  const filter = useTransactionsStore(state => state.filter)
  const possibleStatus = ['incomplete', 'completed', 'failed']
  const connectSocket = () => {
    const socket = connect({
      auth: async (cb) => {
        // todo: add endpoint to retrieve transactions if is successful
        cb(credentials)
      }
    })
    socket.on(`new_transaction`, (data: Transaction) => {
      console.log(data)
      notifyUser(data)
      addTransaction(data);
    })

    socket.on('connect_error', (err) => {
      console.log(err.message)
    })
  }

  const notifyUser = (data: Transaction) => {
    playSound();
    new Notification(`You received ${data.amount} from ${data.sender} | ${data.senderBank}`,{
      body: data.narration,
      icon: '/logo.svg'
    })
  }

  const playSound  =  ()=>{ 
    return notifyAudio.current?.play()
  }

  const cleanUpSocketConnection = () => {
    socket?.disconnect()
  }

  const registerNotificaion = () => {
    
    if(!("Notification" in window)) return;
    
    if( ["granted", "denied"].includes(Notification.permission)) return;

    Notification.requestPermission().then((value)=>{
      if(value !== 'granted') {
        console.log("User rejected notification request")
      }
    }).catch(e=>{
      console.log("Failed to acquire notificaion: ",e.message)
    })
  }

  useEffect(()=>{
    const audio = new Audio("/notify.mp3")
    audio.addEventListener('canplaythrough', ()=>{
      console.log("notification sound loaded.")
    }, false)
  },[notifyAudio])

  useEffect(()=>{
    registerNotificaion()
  },[])
  return (
    <>
      <header className='flex items-center relative'>
        <a href="/" className={`logo ${connected? 'text-teal-600': 'text-gray-500'}`} >
          <svg className='w-24 fill-current transition duration-700 ease-linear' viewBox="0 0 97 44" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.8581 1.16735C5.88609 2.78307 7.05749 4.26549 8.22686 5.7681C10.8039 9.08839 13.3568 12.4491 16.1277 15.6118C16.9719 16.5752 17.9292 17.3972 19.2178 17.7022C24.388 18.914 28.7767 15.1675 29.3766 10.1063C29.9542 5.23693 26.6601 0.0767464 21.4373 0.0545304C16.0032 0.0343339 10.5676 0.0161571 5.13075 0C4.44407 0 4.44407 0.385752 4.65815 0.807857C4.71845 0.931115 4.78519 1.05111 4.8581 1.16735ZM41.5146 42.4125C41.1248 42.047 40.735 41.6814 40.3412 41.3219C38.0247 39.1811 13.7344 19.5905 2.88288 1.3673C2.81817 1.25126 2.75952 1.13194 2.70718 1.00982C2.69192 0.966167 2.66506 0.927494 2.62947 0.897959C2.59389 0.868425 2.55093 0.849145 2.50521 0.842191C2.30325 0.811897 2.2366 0.977507 2.15581 1.10676C1.83469 1.60966 1.70139 2.18727 1.54992 2.75075C0.616845 6.29725 0.212916 9.92049 0.0574037 13.568C-0.0432272 15.7686 -0.011529 17.9733 0.152327 20.1702C0.380547 23.0522 0.845065 25.8858 1.80641 28.6204C2.71323 31.2015 4.02802 33.5362 6.15673 35.3215C7.47153 36.4027 9.02406 37.1564 10.6868 37.5209C11.0382 37.6037 11.0907 37.5391 10.9695 37.1857C10.9493 37.1231 10.9251 37.0625 10.9029 37.0019C9.77458 34.0855 8.64493 31.1698 7.51393 28.2548C7.18674 27.4086 6.85552 26.5644 6.52632 25.7181C6.66111 25.7976 6.77042 25.9139 6.84139 26.0534C7.88352 27.8872 8.91556 29.7291 9.96779 31.5569C11.0826 33.4978 12.3207 35.3438 14.0333 36.8201C15.5402 38.1172 17.3103 39.0722 19.2218 39.6193C20.5829 40.0321 21.9858 40.2916 23.4045 40.3929C23.5176 40.3929 23.6529 40.4716 23.7337 40.3626C23.8145 40.2535 23.7014 40.1445 23.6428 40.0495C23.0369 39.0821 22.4169 38.1127 21.7968 37.1493L16.8871 29.5191C15.4585 27.3056 14.0374 25.0907 12.6236 22.8745L10.9453 20.2489L11.018 20.2085C11.0685 20.2671 11.121 20.3216 11.1675 20.3822C12.5812 22.1454 13.892 23.9711 15.235 25.7807C16.9416 28.0831 18.6543 30.3775 20.5204 32.5566C21.5303 33.7341 22.5623 34.8914 23.6731 35.9719C25.1984 37.4937 26.8761 38.8547 28.6798 40.0334C29.8641 40.7941 31.1195 41.438 32.4282 41.9561C33.9091 42.5426 35.4694 42.9041 37.0573 43.0285C38.5115 43.1435 39.9746 43.0531 41.4035 42.7599C41.5025 42.7397 41.6297 42.7458 41.658 42.6185C41.6863 42.4913 41.5772 42.463 41.5146 42.4125Z"></path>
            <path d="M45.0789 13.0425H38.3495L36.758 24.2697L36.7237 24.4999C36.7237 24.5706 36.7237 24.6433 36.7237 24.714C36.7223 25.0215 36.7816 25.3262 36.8982 25.6107C37.0148 25.8952 37.1863 26.154 37.4029 26.3721C37.6196 26.5903 37.8772 26.7636 38.1609 26.8821C38.4446 27.0006 38.7489 27.0621 39.0563 27.0629H40.2136L40.26 26.7276L40.771 23.1367L40.973 21.6664H42.5422L43.8267 25.3199L43.9459 25.6572C44.1159 26.0467 44.3889 26.3825 44.7355 26.6284C45.0821 26.8743 45.4892 27.021 45.913 27.0528H48.8758L48.2942 25.5198L47.2096 22.6661L46.5714 21.0039C47.2169 20.6184 47.7638 20.0881 48.169 19.4549C48.5742 18.8327 48.8389 18.1297 48.9445 17.3948C49.1142 16.1521 48.8301 15.1153 48.0922 14.2846C47.3544 13.4538 46.3499 13.0398 45.0789 13.0425ZM41.3123 19.3216L41.8616 15.3772H43.8267C44.0338 15.3647 44.2404 15.4082 44.4248 15.5031C44.6092 15.598 44.7647 15.7407 44.8749 15.9164C45.1032 16.278 45.1738 16.791 45.0769 17.4574C44.9072 18.7002 44.3054 19.3216 43.2713 19.3216H41.3123Z" ></path>
            <path d="M57.843 17.6538C57.5052 17.2326 57.0736 16.8963 56.5827 16.6715C56.0917 16.4468 55.5551 16.3398 55.0155 16.3592C54.7196 16.3599 54.4243 16.3863 54.133 16.4379C53.8063 16.4974 53.4849 16.5825 53.1716 16.6924C52.8272 16.8126 52.4957 16.9669 52.182 17.1529C51.8406 17.358 51.5241 17.602 51.2388 17.88C50.5732 18.5137 50.069 19.2976 49.7685 20.1662C49.5716 20.6984 49.4361 21.2513 49.3646 21.8142C49.2444 22.5423 49.2506 23.2856 49.3828 24.0116C49.476 24.5723 49.6866 25.1071 50.0008 25.5809C50.2811 25.9719 50.6343 26.3052 51.0409 26.5624C51.4131 26.8063 51.8223 26.9884 52.2527 27.1016C52.6436 27.2002 53.0452 27.2497 53.4483 27.2491C54.757 27.2491 55.8625 26.6014 56.7646 25.3062L56.5101 27.0633H60.2565L61.749 16.5611H58.0006L57.843 17.6538ZM57.3805 20.8973L57.324 21.3012C57.1857 22.3435 56.7839 23.3334 56.1566 24.1772C56.0617 24.3024 55.9668 24.4175 55.8719 24.5205C55.4478 24.9851 55.0001 25.2173 54.5288 25.2173C53.9525 25.2173 53.5405 24.8996 53.2928 24.264C53.045 23.6285 52.9925 22.8274 53.1353 21.8607C53.2793 20.8145 53.5897 19.9777 54.0663 19.3503C54.543 18.7228 55.0815 18.4084 55.682 18.4071C55.9007 18.4094 56.1161 18.4596 56.3133 18.5542C56.5104 18.6487 56.6845 18.7854 56.8231 18.9544C57.0504 19.2191 57.2179 19.5297 57.3141 19.865C57.4103 20.2003 57.4329 20.5524 57.3805 20.8973Z" ></path>
            <path d="M83.6585 17.2898C83.2948 16.9778 82.8665 16.7502 82.4043 16.6233C81.7772 16.4374 81.1255 16.3482 80.4715 16.3587C78.9004 16.3399 77.3749 16.8869 76.1737 17.8997C74.962 18.8737 74.1517 20.2599 73.8976 21.7936C73.6431 23.2989 74.0093 24.5841 74.9963 25.6491C75.9832 26.7141 77.2913 27.2473 78.9204 27.2487C79.9446 27.2627 80.9572 27.0306 81.8732 26.5721C82.7172 26.1612 83.4201 25.5089 83.8928 24.6979L82.8931 23.9122C82.6092 24.1929 82.2965 24.4427 81.96 24.6575C81.3826 25.0243 80.7112 25.2158 80.0272 25.2088C78.2768 25.2088 77.4555 24.3074 77.5632 22.5045C77.5667 22.4606 77.5864 22.4195 77.6185 22.3892C77.6506 22.359 77.6928 22.3418 77.7369 22.3409C79.301 22.3426 80.8464 22.0021 82.265 21.3432C83.4768 20.8047 84.183 19.9867 84.3836 18.8894C84.42 18.6223 84.3794 18.3504 84.2664 18.1057C84.1209 17.7955 83.9141 17.518 83.6585 17.2898ZM81.4712 19.4589C81.2881 20.2977 80.2945 20.8013 78.4903 20.9696L77.8238 21.0261C78.0013 20.3283 78.3325 19.679 78.7932 19.1257C78.9647 18.9053 79.1831 18.7257 79.4325 18.6C79.6818 18.4743 79.956 18.4055 80.2352 18.3986C80.4073 18.3976 80.5788 18.4173 80.7462 18.4572C80.8939 18.4934 81.0355 18.5512 81.1663 18.6288C81.2549 18.6774 81.3304 18.7467 81.3864 18.8308C81.4422 18.9244 81.4784 19.0282 81.493 19.1362C81.5076 19.2441 81.5002 19.3539 81.4712 19.4589Z" ></path>
            <path d="M93.0071 16.3593C92.5886 16.3556 92.1719 16.4148 91.7711 16.535C91.3634 16.6694 90.9846 16.879 90.6542 17.153C90.2538 17.4838 89.9034 17.8709 89.6141 18.3022L89.8746 16.5613H86.1201L85.2557 22.6565L84.7225 26.3989L84.6235 27.0634H86.3443C86.8993 27.0659 87.4371 26.8711 87.8618 26.5137C88.2865 26.1564 88.5704 25.6597 88.6628 25.1124L88.681 24.9791L89.2283 21.1418C89.5735 20.4022 90.0119 19.7099 90.533 19.0818C90.9369 18.6253 91.355 18.3951 91.761 18.3951C92.5446 18.3951 92.832 19.1538 92.6233 20.6712L92.1447 24.0521L92.0477 24.7388C92.0487 25.3203 92.2662 25.8806 92.6579 26.3104C93.0496 26.7402 93.5874 27.0087 94.1663 27.0634H95.4609L95.4993 26.7847L96.0224 23.0766L96.3819 20.5299C96.565 19.2736 96.3462 18.2638 95.7255 17.5004C95.1048 16.737 94.1987 16.3566 93.0071 16.3593Z"></path>
            <path d="M71.496 16.561L68.3211 23.0239L68.1979 22.418C68.0783 22.3993 67.9575 22.3899 67.8364 22.3897C67.2328 22.3877 66.6518 22.6193 66.2151 23.036C65.7785 23.4528 65.52 24.0223 65.4939 24.6254C65.4678 25.2284 65.6761 25.8182 66.0751 26.2711C66.4741 26.7241 67.0329 27.005 67.6345 27.0551H68.0525C68.4278 27.0201 68.789 26.895 69.1055 26.6903C69.422 26.4857 69.6844 26.2076 69.8702 25.8797L69.9772 25.6656L74.5578 16.561H71.496Z" ></path>
            <path d="M65.1076 16.561H63.0415L63.2435 17.486L64.0008 20.9558C64.3139 21.1241 64.6612 21.2188 65.0164 21.2327C65.3716 21.2466 65.7252 21.1792 66.0504 21.0358C66.3757 20.8924 66.6639 20.6767 66.8932 20.4051C67.1224 20.1334 67.2867 19.8131 67.3735 19.4684C67.4603 19.1237 67.4674 18.7638 67.3941 18.416C67.3208 18.0682 67.1691 17.7417 66.9506 17.4613C66.7321 17.181 66.4526 16.9541 66.1332 16.7981C65.8138 16.6421 65.463 16.561 65.1076 16.561Z" ></path>
          </svg>
        </a>
        <h1 title={connected? "Connected": "Offline"} className={`flex items-center font-bold text-xl ${connected? 'text-teal-600 animate-bounce top-4': 'text-gray-500 top-3'} right-20  relative`}>
           <span> Warble</span>
           <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" viewBox="0 0 24 24" 
            strokeWidth={1.5} stroke="currentColor" 
            className={`size-4 transition-transform duration-1000 ease-in-out ${connected?'': 'rotate-180'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
           </svg>

        </h1>
      </header>

      <section>
        <article className='grid grid-cols-2 gap-2  bg-gray-100 p-2'>
        
            <label className='block' htmlFor="acc-no">
              <span>Acc No</span>
             <input placeholder='enter acc no'
                    disabled={connected}
                    id="acc-no" value={credentials.acc ?? ''} 
                    onChange={(event) => setWarbleCredentials((state) => ({ ...state, acc: event.target.value, }))}
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
             />
          
            </label>

          
            <label className='block' htmlFor="warble-key">
              <span>Warble Key</span>
              <input type='password'
                placeholder='enter key'
                disabled={connected}
                id="warble-key" value={credentials.key ?? ''}
                onChange={(event) => setWarbleCredentials((state) => ({ ...state, key: event.target.value, }))}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
              />
            </label>
          <div className="card col-span-2">
            <button className={`button button-primary`} disabled={!credentials.acc?.length || !credentials.key?.length} onClick={connected ? cleanUpSocketConnection : connectSocket}>
              {!connected ? 'Connect to ' : 'Disconnect from'} Stream
            </button>
          </div>
        </article>

        <div className='space-y-3 p-3'>
          {(connected || totalTransactions > 0) && <>
            <div className=' flex items-center space-x-3'>
              <h1 className='font-bold text-gray-700'>
                <span> Transactions ({totalTransactions}) </span> <small className='text-xs italic font-light'>{connected? 'connected': 'not connected'}</small>
              </h1>
              <label>
                Status:
                <select value={filter} onChange={(event)=> setFilter(event.target.value)}>
                  <option value=""
                  >All</option>
                  {possibleStatus.map(item=><option key={item} value={item}>{item.toUpperCase()}</option>)}
                </select>
              </label>
            </div>
            <section className='h-[60svh] overflow-y-auto overflow-x-hidden space-y-2'>
              {transactions.map((item) => <TransactionCard key={item.sessionId} transaction={item} />)}
            </section>
          </>}
        </div>
      </section>
      <audio ref={notifyAudio} src='/notify.mp3' />
    </>
  )
}

export default App
