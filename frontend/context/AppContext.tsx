import React, { createContext, useContext, useReducer, useState, useCallback, useEffect, ReactNode } from 'react';
import { CartItem, Product, UserInfo, AppContextType, Toast, ToastType } from '../types';

// Action types define what operations we can perform
type Action =
  | { type: 'CART_ADD_ITEM'; payload: CartItem }
  | { type: 'CART_REMOVE_ITEM'; payload: { productId: string; size: string; color: string } }
  | { type: 'CART_UPDATE_QUANTITY'; payload: { productId: string; size: string; color: string; quantity: number } }
  | { type: 'CART_CLEAR' }
  | { type: 'FAVORITES_ADD_ITEM'; payload: Product }
  | { type: 'FAVORITES_REMOVE_ITEM'; payload: string }
  | { type: 'USER_LOGIN'; payload: UserInfo }
  | { type: 'USER_LOGOUT' };

// This is the shape of our global state
interface AppState {
  cart: CartItem[];
  favorites: Product[];
  userInfo: UserInfo | null;
}

// Load initial state from Local Storage (corrupt JSON must not crash the app)
const safeParse = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

const initialState: AppState = {
  cart: safeParse<CartItem[]>('cartItems', []),
  favorites: safeParse<Product[]>('favorites', []),
  userInfo: safeParse<UserInfo | null>('userInfo', null),
};

// The Reducer function handles all state updates
const appReducer = (state: AppState, action: Action): AppState => {
  let newCart;
  switch (action.type) {
    // --- ⛔️ Shothik Fix: Cart shob _id diye check korbe ---
    case 'CART_ADD_ITEM': {
        const newItem = action.payload;
        const existItemIndex = state.cart.findIndex(
        (item) =>
            item.product._id === newItem.product._id && // _id check
            item.size === newItem.size &&
            item.color === newItem.color
        );
        if (existItemIndex > -1) {
          newCart = state.cart.map((item, index) =>
              index === existItemIndex ? { ...item, quantity: item.quantity + newItem.quantity } : item
          );
        } else {
          newCart = [...state.cart, newItem];
        }
        localStorage.setItem('cartItems', JSON.stringify(newCart));
        return { ...state, cart: newCart };
    }
    // --- ⛔️ Shothik Fix: Delete Button Logic ---
    case 'CART_REMOVE_ITEM': {
      const { productId, size, color } = action.payload;
      newCart = state.cart.filter(
        (item) => !(item.product._id === productId && item.size === size && item.color === color) // _id check
      );
      localStorage.setItem('cartItems', JSON.stringify(newCart));
      return { ...state, cart: newCart };
    }
    // --- ⛔️ Shothik Fix: Increase/Decrease Button Logic ---
     case 'CART_UPDATE_QUANTITY': {
      const { productId, size, color, quantity } = action.payload;
      // Jodi quantity komate komate 0 hoy, tahole auto-delete hobe
      newCart = state.cart.map((item) =>
        item.product._id === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      ).filter(item => item.quantity > 0); // Shudhu 0-er cheye beshi quantity rakho
      
      localStorage.setItem('cartItems', JSON.stringify(newCart));
      return { ...state, cart: newCart };
    }
    case 'CART_CLEAR':
      localStorage.removeItem('cartItems');
      return { ...state, cart: [] };

    // --- Favorites (using _id) ---
    case 'FAVORITES_ADD_ITEM': {
      const newItem = action.payload;
      const existItem = state.favorites.find((item) => item._id === newItem._id);
      const newFavorites = existItem ? state.favorites : [...state.favorites, newItem];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return { ...state, favorites: newFavorites };
    }
    case 'FAVORITES_REMOVE_ITEM': {
      const productId = action.payload;
      const newFavorites = state.favorites.filter((item) => item._id !== productId);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return { ...state, favorites: newFavorites };
    }

    // --- Auth ---
    case 'USER_LOGIN':
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
      return { ...state, userInfo: action.payload };
    case 'USER_LOGOUT':
      localStorage.removeItem('userInfo');
      return { ...state, userInfo: null };

    default:
      return state;
  }
};

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // --- Toast notifications (replaces window.alert) ---
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    window.setTimeout(() => dismissToast(id), 3500);
  }, [dismissToast]);

  // Auto-logout when the API reports an expired/invalid token (see lib/api.ts)
  useEffect(() => {
    const onAuthExpired = () => {
      dispatch({ type: 'USER_LOGOUT' });
      showToast('Your session has expired. Please log in again.', 'info');
    };
    window.addEventListener('app:auth-expired', onAuthExpired);
    return () => window.removeEventListener('app:auth-expired', onAuthExpired);
  }, [showToast]);

   const addToCart = (product: Product, size: string, color: string) => {
    dispatch({ type: 'CART_ADD_ITEM', payload: { product, quantity: 1, size, color } });
  };
  
  // --- ⛔️ Shothik Fix: Ei function-gulo ekhon dispatch korbe ---
  const removeFromCart = (productId: string, size: string, color: string) => {
    dispatch({ type: 'CART_REMOVE_ITEM', payload: { productId, size, color } });
  };
   const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    dispatch({ type: 'CART_UPDATE_QUANTITY', payload: { productId, size, color, quantity } });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CART_CLEAR' });
  };

  const addToFavorites = (product: Product) => {
    dispatch({ type: 'FAVORITES_ADD_ITEM', payload: product });
  };
  const removeFromFavorites = (productId: string) => {
    dispatch({ type: 'FAVORITES_REMOVE_ITEM', payload: productId });
  };
   const isFavorite = (productId: string) => {
    return state.favorites.some((item) => item._id === productId);
  };

  const loginUser = (userData: UserInfo) => {
    dispatch({ type: 'USER_LOGIN', payload: userData });
  };
  const logoutUser = () => {
    dispatch({ type: 'USER_LOGOUT' });
  };

  const contextValue: AppContextType = {
    cart: state.cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    favorites: state.favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    userInfo: state.userInfo,
    loginUser,
    logoutUser,
    toasts,
    showToast,
    dismissToast,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

// Create the custom hook
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};