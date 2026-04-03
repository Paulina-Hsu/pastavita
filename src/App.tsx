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
  {
    id: 1,
    name: '經典番茄肉醬麵',
    category: '紅醬',
    price: 180,
    description: '使用新鮮番茄與精選澳洲牛絞肉，慢火燉煮出的濃郁家鄉味。',
    image: '/22722_0.jpg',
  },
  {
    id: 2,
    name: '香辣茄汁海鮮麵',
    category: '紅醬',
    price: 260,
    description: '豐富的海鮮配料搭配微辣的茄汁，嗜辣者的首選。',
    image: '/22723_0.jpg',
  },
  {
    id: 3,
    name: '奶油培根蛋黃麵',
    category: '白醬',
    price: 200,
    description: '濃郁鮮奶油與帕馬森起司，伴隨酥脆培根，口感滑順。',
    image: '/22724_0.jpg',
  },
  {
    id: 4,
    name: '黑松露奶油野菇麵',
    category: '白醬',
    price: 240,
    description: '頂級黑松露醬配上綜合野菇，每一口都是奢華享受。',
    image: '/22725_0.jpg',
  },
  {
    id: 5,
    name: '羅勒青醬嫩雞麵',
    category: '青醬',
    price: 220,
    description: '現磨羅勒與堅果製成的青醬，搭配舒肥嫩雞胸。',
    image: '/22726_0.jpg',
  },
  {
    id: 6,
    name: '羅勒青醬海鮮麵',
    category: '青醬',
    price: 280,
    description: '濃郁青醬完美襯托鮮蝦、蛤蜊與花枝的鮮美。',
    image: '/22727_0.jpg',
  },
  {
    id: 7,
    name: '蒜香辣味培根麵',
    category: '清炒',
    price: 170,
    description: '大量大蒜與乾辣椒爆香，經典意式清爽風味。',
    image: '/22728_0.jpg',
  },
  {
    id: 8,
    name: '白酒蛤蜊義大利麵',
    category: '清炒',
    price: 230,
    description: '新鮮蛤蜊釋放出的鮮甜湯汁，伴隨淡雅酒香。',
    image: '/22729_0.jpg',
  },
];

const CATEGORIES = ['全部', '紅醬', '白醬', '青醬', '清炒'];

type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
};

type CartItem = MenuItem & {
  quantity: number;
};

type OrderStatus = 'submitting' | 'success' | null;
type OrderType = '外帶' | '內用';

const App = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(null);
  
  // 新增：控制「內用/外帶」與「桌號」的狀態
  const [orderType, setOrderType] = useState<OrderType>('外帶');
  const [tableNumber, setTableNumber] = useState('');

  const filteredMenu = useMemo(() => {
    return activeCategory === '全部'
      ? MENU_DATA
      : MENU_DATA.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    try {
      if (cart.length === 0) {
        alert('請先選擇商品');
        return;
      }

      // 新增防呆機制：如果選內用，強迫一定要填桌號
      if (orderType === '內用' && tableNumber.trim() === '') {
        alert('您選擇了「內用」，請輸入桌號喔！');
        return;
      }

      setOrderStatus('submitting');

      // 將最新的點餐方式與桌號放入 payload 中
      const payload = {
        customerName: '現場顧客', // 之後若有需要可以再加輸入框
        phone: '',
        orderType: orderType,
        tableNumber: orderType === '內用' ? tableNumber : '', // 外帶就清空桌號
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
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
        }
      );

      setOrderStatus('success');
      setCart([]);
      setTableNumber(''); // 結帳成功後清空桌號
      
      console.log('訂單已送出，請檢查 Google 試算表！');

    } catch (error) {
      console.error('送出失敗：', error);
      alert('訂單送出失敗，請檢查網路連線或稍後再試');
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

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ShoppingBag className="w-6 h-6 text-slate-700" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <section className="mb-10 text-center md:text-left md:flex md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              新鮮手作義大利麵
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> 預計取餐：20-30 分鐘
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> 台北市大安區忠孝東路
              </span>
            </div>
          </div>
        </section>

        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredMenu.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="relative h-40 sm:h-48 overflow-hidden bg-white">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=400';
                  }}
                />
              </div>
              <div className="p-3 sm:p-4">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <h3 className="font-bold text-lg text-slate-800">
                    {item.name}
                  </h3>
                  <span className="text-amber-600 font-bold shrink-0">
                    ${item.price}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">
                  {item.description}
                </p>
                <button
                  onClick={() => addToCart(item)}
                  className="w-full py-3 sm:py-2 bg-slate-50 hover:bg-amber-600 hover:text-white text-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 hover:border-amber-600"
                >
                  <Plus className="w-4 h-4" /> 加入購物車
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen sm:max-w-md flex flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> 您的訂單
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cartItemCount === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <p className="font-medium">購物車是空的</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                          <p className="text-slate-500 text-sm">${item.price}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 px-2 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold min-w-[20px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                  
                  {/* ====== 新增：內用/外帶切換按鈕 ====== */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setOrderType('外帶')}
                      className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
                        orderType === '外帶' 
                          ? 'bg-slate-900 text-white shadow-md' 
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      外帶
                    </button>
                    <button
                      onClick={() => setOrderType('內用')}
                      className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
                        orderType === '內用' 
                          ? 'bg-slate-900 text-white shadow-md' 
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      內用
                    </button>
                  </div>

                  {/* ====== 新增：只有選擇「內用」時，才會出現桌號輸入框 ====== */}
                  {orderType === '內用' && (
                    <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        請輸入桌號 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="例如：3"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>
                  )}
                  {/* ================================== */}

                  <div className="flex justify-between items-center text-slate-900 font-bold text-xl pt-2">
                    <span>總計</span>
                    <span className="text-amber-600">${totalAmount}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold shadow-lg transition-colors"
                  >
                    確認下單
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {orderStatus === 'success' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold">訂單已送出！</h2>
            <button
              onClick={() => setOrderStatus(null)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
            >
              太棒了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;