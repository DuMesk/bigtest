import { create } from 'zustand';
import { supabase } from './supabase';

interface AdminState {
  isAdmin: boolean;
  checkAdminStatus: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  isAdmin: false,
  checkAdminStatus: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', session.user.id)
        .single();
      
      set({ isAdmin: !!adminUser });
    } else {
      set({ isAdmin: false });
    }
  },
}));

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ products: data || [] });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  addProduct: async (product) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('products')
        .insert([product]);

      if (error) throw error;
      get().fetchProducts();
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      get().fetchProducts();
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  updateProduct: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      get().fetchProducts();
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));

interface AppointmentState {
  availableSlots: Array<{
    id: string;
    barber_id: number;
    date: string;
    time: string;
  }>;
  fetchAvailableSlots: (barberId: number, date: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  availableSlots: [],
  fetchAvailableSlots: async (barberId: number, date: string) => {
    const { data } = await supabase
      .from('available_slots')
      .select('*')
      .eq('barber_id', barberId)
      .eq('date', date)
      .eq('is_available', true);
    
    set({ availableSlots: data || [] });
  },
}));