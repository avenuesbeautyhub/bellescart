// Cart store for managing cart state
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
};

export const cartStore = {
  state: initialState,
  
  addItem(item: CartItem) {
    this.state.items.push(item);
    this.updateTotal();
  },
  
  removeItem(id: string) {
    this.state.items = this.state.items.filter(item => item.id !== id);
    this.updateTotal();
  },
  
  updateTotal() {
    this.state.total = this.state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },
  
  getCart() {
    return this.state;
  },
  
  clearCart() {
    this.state.items = [];
    this.state.total = 0;
  },
};
