import { useState, useMemo } from 'react';
import { 
  ShoppingBag, Plus, Minus, X, CheckCircle2, 
  Utensils, Clock, MapPin 
} from 'lucide-react';

// --- 1. Firebase 初始化 ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5vn8Y8iN9301Yzb7Vs0MVkxUYGiTcyCw",
  authDomain: "pasta-vita.firebaseapp.com",
  projectId: "pasta-vita",
  storageBucket: "pasta-vita.firebasestorage.app",
  messagingSenderId: "264724503629",
  appId: "1:264724503629:web:ed6f4065d8563ec4e45004",
  measurementId: "G-0JN9RL6RC5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 2. 菜單資料 ---
const MENU_DATA = [
  { id: 1, name: '經典番茄肉醬麵', category: '紅醬', price: 180, description: '使用新鮮番茄與精選澳洲牛絞肉，慢火燉煮出的濃郁家鄉味。', image: '/22722_0.jpg' },
  { id: 2, name: '香辣茄汁海鮮麵', category: '紅醬', price: 260, description: '豐富的海鮮配料搭配微辣的茄汁，嗜辣者的首選。', image: '/22723_0.jpg' },
  { id: 3, name: '奶油培根蛋黃麵', category: '白醬', price: 200, description: '濃郁鮮奶油與帕馬森起司，伴隨酥脆培根，口感滑順。', image: '/22724_0.jpg' },
  { id: 4, name: '黑松露奶油野菇麵', category: '白醬', price: 240, description: '頂級黑松露醬配上綜合野菇，每一口都是奢華享受。', image: '/22725_0.jpg' },
  { id: 5, name: '羅勒青醬嫩雞麵', category: '青醬', price: 220, description: '現磨羅勒與堅果製成的青醬，搭配舒肥嫩雞胸。', image: '/22726_0.jpg' },
  { id: 6, name: '羅勒青醬海鮮麵', category: '青醬', price: 280, description: '濃郁青醬完美襯托鮮蝦、蛤蜊與花枝的鮮美。', image: '/22727_0.jpg' },
  { id: 7, name: '蒜香辣味培根麵', category: '清炒', price: 170, description: '大量大蒜與乾辣椒爆香，經典意式清爽風味。', image: '/22728_0.jpg' },
  { id: 8, name: '白酒蛤蜊義大利麵', category: '清炒', price: 230, description: '新鮮蛤蜊釋放出的鮮甜湯汁，伴隨淡雅酒香。', image: '/22729_0.jpg' },
];

const CATEGORIES = ['全部', '紅醬', '白醬', '青醬', '清炒'];

const App = () => {
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [orderType, setOrderType] = useState('外帶');
  const [tableNumber, setTableNumber] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneLast3, setPhoneLast3] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('現金');

  const filteredMenu = useMemo(() => {
    return activeCategory === '全部' ? MENU_DATA : MENU_DATA.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('請先選擇商品');
    if (orderType === '內用' && (!nickname || !tableNumber)) return alert('請填寫暱稱與桌號！');
    if (orderType === '外帶' && !phoneLast3) return alert('請輸入手機末三碼！');

    try {
      setOrderStatus('submitting');
      
      const payload = {
        customerName: orderType === '內用' ? nickname : `手機末3碼:${phoneLast3}`,
        orderType,
        tableNumber: orderType === '內用' ? tableNumber : 'N/A',
        paymentMethod,
        items: cart.map(i => `${i.name} x ${i.quantity}`).join(', '),
        totalAmount,
        status: "新訂單",
        timestamp: serverTimestamp()
      };

      // 1. 存入 Firebase
      await addDoc(collection(db, "orders"), payload);

      // 2. 傳送到 Google Apps Script (這裡已經幫妳把引號加好了)
      await fetch('https://script.google.com/macros/s/AKfycbwlX4kQzLy5YD7IaDPVRIyw16C90OU1kIf0XwLL4Ua-rN6ppE3KfLfqhl7z3DuIbOtG-w/exec', {
        method: 'POST', 
        mode: 'no-cors', 
        body: JSON.stringify(payload)
      });

      setOrderStatus('success');
      setCart([]); setIsCartOpen(false);
    } catch (error) {
      alert('下單失敗，請檢查連線！');
      setOrderStatus(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 頂部導航欄 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="text-amber-600 w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">PASTA VITA</h1>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 p-2 px-4 hover:bg-amber-50 rounded-full group">
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-slate-700 group-hover:text-amber-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">{cartItemCount}</span>
              )}
            </div>
            <span className="font-bold text-slate-700 group-hover:text-amber-600">購物車</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 店家資訊 */}
        <section className="mb-10">
          <h2 className="text-4xl font-extrabold text-slate-800 mb-4">新鮮手作義大利麵</h2>
          <div className="flex flex-wrap items-center gap-4 text-slate-500 font-medium">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
              <Clock className="w-4 h-4 text-amber-500" />預計取餐：20-30 分鐘
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
              <MapPin className="w-4 h-4 text-amber-500" />台北市大安區忠孝東路
            </div>
          </div>
        </section>

        {/* 分類篩選 */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${activeCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>{cat}</button>
          ))}
        </div>

        {/* 產品清單 - 採用 object-contain 確保圖上文字不被切掉 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredMenu.map(item => (
            <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative h-52 bg-slate-100 flex items-center justify-center p-2 rounded-t-3xl">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain object-center transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                  <span className="text-amber-600 font-bold">${item.price}</span>
                </div>
                <p className="text-slate-500 text-xs mb-5 line-clamp-3 leading-relaxed">{item.description}</p>
                <button onClick={() => addToCart(item)} className="w-full py-3 bg-slate-50 hover:bg-amber-600 hover:text-white text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-100">
                  <Plus className="w-4 h-4" /> 加入購物車
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 購物車側欄 */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><ShoppingBag className="w-6 h-6 text-amber-600" /> 您的訂單</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex-1 font-bold text-slate-800">{item.name}</div>
                  <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-amber-600"><Minus className="w-4 h-4" /></button>
                    <span className="font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-amber-600"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <div className="text-center py-20 text-slate-400">購物車是空的</div>}
            </div>

            {/* 下單區域 */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-5">
              <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-2xl">
                <button onClick={() => setOrderType('外帶')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${orderType === '外帶' ? 'bg-[#00122e] text-white shadow-md' : 'text-slate-500'}`}>外帶</button>
                <button onClick={() => setOrderType('內用')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${orderType === '內用' ? 'bg-[#00122e] text-white shadow-md' : 'text-slate-500'}`}>內用</button>
              </div>
              
              <div className="space-y-3">
                {orderType === '內用' ? (
                  <>
                    <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="您的暱稱" className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none" />
                    <input type="text" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="桌號" className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none" />
                  </>
                ) : (
                  <input type="text" value={phoneLast3} onChange={e => setPhoneLast3(e.target.value)} placeholder="手機末 3 碼" maxLength={3} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none" />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-500 ml-1">付款方式</p>
                <div className="flex gap-2">
                  {['現金', '信用卡', 'LINE PAY'].map((method) => (
                    <button key={method} onClick={() => setPaymentMethod(method)} className={`flex-1 py-2 text-sm rounded-full border transition-all font-bold ${paymentMethod === method ? 'bg-[#d35400] text-white border-[#d35400]' : 'bg-white text-slate-400 border-slate-200'}`}>{method}</button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-2xl font-bold">
                <span className="text-xl">總計</span><span className="text-[#d35400]">${totalAmount}</span>
              </div>
              <button onClick={handleCheckout} className="w-full py-4 bg-[#d35400] text-white rounded-2xl font-black text-lg shadow-xl hover:bg-[#b34500] transition-all">確認下單</button>
            </div>
          </div>
        </div>
      )}

      {/* 成功彈窗 */}
      {orderStatus === 'success' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-6">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center space-y-6 shadow-2xl">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-3xl font-black text-slate-800">訂單已送出！</h2>
            <button onClick={() => setOrderStatus(null)} className="w-full py-4 bg-[#00122e] text-white rounded-2xl font-bold">太棒了</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;