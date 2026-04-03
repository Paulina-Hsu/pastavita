import { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Utensils,
  Clock,
  MapPin,
} from 'lucide-react';

// 菜單資料定義
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

type MenuItem = { id: number; name: string; category: string; price: number; description: string; image: string; };
type CartItem = MenuItem & { quantity: number; };
type OrderStatus = 'submitting' | 'success' | null;
type OrderType = '外帶' | '內用';
type PaymentMethod = '現金' | '信用卡' | 'LINE PAY';

const App = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(null);
  
  // 訂單相關狀態
  const [orderType, setOrderType] = useState<OrderType>('外帶');
  const [tableNumber, setTableNumber] = useState('');
  const [nickname, setNickname] = useState('');      // 內用時使用
  const [phoneLast3, setPhoneLast3] = useState('');  // 外帶時使用
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('現金');

  const filteredMenu = useMemo(() => {
    return activeCategory === '全部'
      ? MENU_DATA
      : MENU_DATA.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter((item) => item.quantity > 0));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('請先選擇商品');

    // 檢查必填欄位
    if (orderType === '內用') {
      if (!nickname.trim()) return alert('請輸入您的暱稱喔！');
      if (!tableNumber.trim()) return alert('請輸入桌號喔！');
    } else {
      if (!phoneLast3.trim()) return alert('請輸入手機末 3 碼以利取餐核對喔！');
    }

    try {
      setOrderStatus('submitting');

      const payload = {
        // 根據訂單類型，決定傳給 Google Sheet "姓名" 欄位的內容
        customerName: orderType === '內用' ? nickname : `手機末3碼:${phoneLast3}`,
        phone: '', 
        orderType: orderType,
        tableNumber: orderType === '內用' ? tableNumber : '',
        paymentMethod: paymentMethod,
        note: '',
        items: cart,
        totalAmount,
      };

      await fetch(
        'https://script.google.com/macros/s/AKfycbyGagsxQXBYsWPo12cyERBN72RhMk6Ca7YZCJVTJhNk4lYFjoRbLQMdjAXB2MSacfCTwA/exec',
        {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        }
      );

      setOrderStatus('success');
      setCart([]);
      setNickname('');
      setPhoneLast3('');
      setTableNumber('');
      setPaymentMethod('現金');
    } catch (error) {
      console.error('送出失敗：', error);
      alert('訂單送出失敗，請檢查網路');
      setOrderStatus(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="text-amber-600 w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">PASTA VITA</h1>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 p-2 px-3 hover:bg-slate-100 rounded-full transition-colors">
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-slate-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="text-sm font-bold text-slate-700">購物車</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-8">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${activeCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredMenu.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md">
              <div className="relative h-48 bg-white overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                  <span className="text-amber-600 font-bold">${item.price}</span>
                </div>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">{item.description}</p>
                <button onClick={() => addToCart(item)} className="w-full py-2 bg-slate-50 hover:bg-amber-600 hover:text-white text-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200">
                  <Plus className="w-4 h-4" /> 加入購物車
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> 您的訂單</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-2xl border p-3">
                  <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                    <p className="text-slate-500 text-sm">${item.price}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 px-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1"><Minus className="w-4 h-4" /></button>
                    <span className="font-bold min-w-[20px] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-slate-50 border-t space-y-4">
                <div className="flex gap-2">
                  <button onClick={() => setOrderType('外帶')} className={`flex-1 py-2.5 rounded-xl font-bold ${orderType === '外帶' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 border'}`}>外帶</button>
                  <button onClick={() => setOrderType('內用')} className={`flex-1 py-2.5 rounded-xl font-bold ${orderType === '內用' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 border'}`}>內用</button>
                </div>

                <div className="space-y-3">
                  {orderType === '內用' ? (
                    <>
                      <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="請輸入您的暱稱 (例如: 王小姐)" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                      <input type="text" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="請輸入桌號" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                    </>
                  ) : (
                    <input type="text" value={phoneLast3} onChange={(e) => setPhoneLast3(e.target.value)} placeholder="請輸入手機末 3 碼" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" maxLength={3} />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">付款方式</label>
                  <div className="flex gap-2">
                    {(['現金', '信用卡', 'LINE PAY'] as PaymentMethod[]).map((method) => (
                      <button key={method} onClick={() => setPaymentMethod(method)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${paymentMethod === method ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-slate-500 border'}`}>{method}</button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-slate-900 font-bold text-xl pt-2">
                  <span>總計</span><span className="text-amber-600">${totalAmount}</span>
                </div>
                <button onClick={handleCheckout} className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold shadow-lg hover:bg-amber-700">確認下單</button>
              </div>
            )}
          </div>
        </div>
      )}

      {orderStatus === 'success' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold">訂單已送出！</h2>
            <button onClick={() => setOrderStatus(null)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">太棒了</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;