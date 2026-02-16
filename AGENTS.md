# AGENTS.md - Arte Guapinol Sales Management System

## 🎯 Contexto del Proyecto

**Nombre:** Arte Guapinol - Sistema de Gestión de Ventas
**Stack Principal:** React + Vite + TypeScript + Supabase
**Propósito:** Aplicación web para gestionar ventas de manera eficiente y profesional

## 📋 Tabla de Contenidos

1. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
2. [Principios de Desarrollo](#principios-de-desarrollo)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Gestión de Estado](#gestión-de-estado)
5. [Base de Datos y Supabase](#base-de-datos-y-supabase)
6. [Componentes y UI](#componentes-y-ui)
7. [Patrones y Mejores Prácticas](#patrones-y-mejores-prácticas)
8. [Performance y Optimización](#performance-y-optimización)
9. [UX/UI Guidelines](#uxui-guidelines)
10. [Testing y Calidad](#testing-y-calidad)
11. [Checklist de Desarrollo](#checklist-de-desarrollo)

---

## 🏗️ Arquitectura del Proyecto

### Arquitectura en Capas (Layered Architecture)

Para un proyecto medianamente pequeño pero escalable, usamos una arquitectura en capas clara:

```
┌─────────────────────────────────────┐
│     Presentation Layer (UI)         │  ← Componentes React
├─────────────────────────────────────┤
│     Business Logic Layer            │  ← Hooks personalizados
├─────────────────────────────────────┤
│     Data Access Layer               │  ← API/Supabase queries
├─────────────────────────────────────┤
│     External Services               │  ← Supabase, APIs externas
└─────────────────────────────────────┘
```

### Principios Arquitectónicos

1. **Separation of Concerns**: Cada capa tiene responsabilidades claramente definidas
2. **Dependency Injection**: Las dependencias se inyectan, no se crean dentro
3. **Single Source of Truth**: Estado centralizado con Zustand
4. **Feature-Based Organization**: Organizar por características, no por tipo de archivo

---

## 🎨 Principios de Desarrollo

### SOLID Principles

#### 1. Single Responsibility Principle (SRP)
```typescript
// ❌ MAL - Componente con múltiples responsabilidades
function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);
  
  return <div>{/* render logic + data fetching + state management */}</div>;
}

// ✅ BIEN - Responsabilidades separadas
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
}

function ProductPage() {
  const { data: products, isLoading } = useProducts();
  
  if (isLoading) return <ProductsLoader />;
  return <ProductsList products={products} />;
}
```

#### 2. Open/Closed Principle (OCP)
```typescript
// ✅ Componente abierto a extensión, cerrado a modificación
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return <button className={cn(baseStyles, variants[variant], sizes[size])} {...props} />;
}
```

#### 3. Liskov Substitution Principle (LSP)
```typescript
// ✅ Los componentes derivados pueden sustituir al base
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
}

function DataTable<T>(props: TableProps<T>) { /* ... */ }
function ProductTable(props: TableProps<Product>) { /* ... */ }
function SalesTable(props: TableProps<Sale>) { /* ... */ }
```

#### 4. Interface Segregation Principle (ISP)
```typescript
// ✅ Interfaces específicas, no una gigante
interface Readable {
  read(): Promise<Data>;
}

interface Writable {
  write(data: Data): Promise<void>;
}

interface Deletable {
  delete(id: string): Promise<void>;
}

// Implementar solo lo necesario
class ProductService implements Readable, Writable {
  async read() { /* ... */ }
  async write(data: Data) { /* ... */ }
}
```

#### 5. Dependency Inversion Principle (DIP)
```typescript
// ✅ Depender de abstracciones, no de implementaciones concretas
interface DataStore {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
}

class SupabaseStore implements DataStore {
  async get(key: string) { /* implementación con Supabase */ }
  async set(key: string, value: any) { /* implementación con Supabase */ }
}

// El hook depende de la abstracción
function useDataStore(store: DataStore) {
  return {
    getData: (key: string) => store.get(key),
    setData: (key: string, value: any) => store.set(key, value)
  };
}
```

---

## 📁 Estructura de Carpetas

```
arte-guapinol/
├── public/
│   └── assets/
│       ├── images/
│       └── icons/
├── src/
│   ├── app/                          # Configuración de la app
│   │   ├── providers/                # Providers (QueryClient, Toast, etc.)
│   │   ├── router/                   # Configuración de rutas
│   │   └── main.tsx                  # Entry point
│   │
│   ├── features/                     # Características por dominio
│   │   ├── auth/
│   │   │   ├── components/           # Componentes específicos de auth
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── hooks/                # Hooks personalizados
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useSession.ts
│   │   │   ├── services/             # Lógica de negocio
│   │   │   │   └── authService.ts
│   │   │   ├── store/                # Estado local de la feature
│   │   │   │   └── authStore.ts
│   │   │   ├── types/                # Tipos TypeScript
│   │   │   │   └── auth.types.ts
│   │   │   └── utils/                # Utilidades específicas
│   │   │       └── validation.ts
│   │   │
│   │   ├── products/
│   │   │   ├── components/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   ├── ProductList.tsx
│   │   │   │   └── ProductFilters.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProducts.ts
│   │   │   │   ├── useProductMutations.ts
│   │   │   │   └── useProductFilters.ts
│   │   │   ├── services/
│   │   │   │   └── productService.ts
│   │   │   ├── store/
│   │   │   │   └── productStore.ts
│   │   │   └── types/
│   │   │       └── product.types.ts
│   │   │
│   │   ├── sales/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── types/
│   │   │
│   │   ├── customers/
│   │   ├── inventory/
│   │   ├── reports/
│   │   └── dashboard/
│   │
│   ├── shared/                       # Código compartido
│   │   ├── components/               # Componentes reutilizables
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── AppLayout.tsx
│   │   │   ├── feedback/
│   │   │   │   ├── Loader.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   └── data-display/
│   │   │       ├── DataTable.tsx
│   │   │       └── StatCard.tsx
│   │   │
│   │   ├── hooks/                    # Hooks compartidos
│   │   │   ├── useDebounce.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useClickOutside.ts
│   │   │
│   │   ├── lib/                      # Configuración de librerías
│   │   │   ├── supabase.ts
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── types/                    # Tipos globales
│   │   │   ├── database.types.ts     # Generado de Supabase
│   │   │   └── common.types.ts
│   │   │
│   │   ├── constants/                # Constantes globales
│   │   │   ├── routes.ts
│   │   │   ├── queryKeys.ts
│   │   │   └── config.ts
│   │   │
│   │   └── utils/                    # Utilidades globales
│   │       ├── formatters.ts
│   │       ├── validators.ts
│   │       └── helpers.ts
│   │
│   ├── styles/                       # Estilos globales
│   │   ├── globals.css
│   │   └── theme.css
│   │
│   └── pages/                        # Páginas (si usas file-based routing)
│       ├── index.tsx
│       ├── products.tsx
│       └── sales.tsx
│
├── .env.example
├── .env.local
├── .eslintrc.cjs
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### Principios de Organización

1. **Feature-First**: Agrupa por característica, no por tipo de archivo
2. **Colocation**: Mantén cerca lo que cambia junto
3. **Shared vs Feature**: Si se usa en 2+ features → shared, si no → dentro de la feature
4. **Flat Structure**: Máximo 3-4 niveles de profundidad

---

## 🔄 Gestión de Estado

### Zustand - Estado Global

```typescript
// src/shared/store/useStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // App preferences
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // User
        user: null,
        setUser: (user) => set({ user }),
        
        // UI
        sidebarOpen: true,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        
        // Preferences
        theme: 'light',
        setTheme: (theme) => set({ theme })
      }),
      {
        name: 'arte-guapinol-storage',
        partialize: (state) => ({ theme: state.theme }) // Solo persistir theme
      }
    )
  )
);
```

### TanStack Query - Estado del Servidor

```typescript
// src/shared/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (antes cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// src/shared/constants/queryKeys.ts
export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.products.lists(), { filters }] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
  sales: {
    all: ['sales'] as const,
    lists: () => [...queryKeys.sales.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.sales.lists(), { filters }] as const,
  },
  // ... más entidades
} as const;
```

### Patrón de Custom Hooks con TanStack Query

```typescript
// src/features/products/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { productService } from '../services/productService';
import type { ProductFilters } from '../types/product.types';

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(JSON.stringify(filters)),
    queryFn: () => productService.getProducts(filters),
    enabled: true, // Solo ejecutar cuando sea necesario
  });
}

// src/features/products/hooks/useProductMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryKeys } from '@/shared/constants/queryKeys';
import { productService } from '../services/productService';
import type { Product, CreateProductDto } from '../types/product.types';

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProductDto) => productService.createProduct(data),
    onSuccess: (newProduct) => {
      // Invalidar y refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      
      // O actualización optimista
      queryClient.setQueryData<Product[]>(
        queryKeys.products.lists(),
        (old = []) => [...old, newProduct]
      );
      
      toast.success('Producto creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear producto');
      console.error(error);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productService.updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: queryKeys.products.detail(id) });
      
      // Snapshot del valor anterior
      const previousProduct = queryClient.getQueryData(queryKeys.products.detail(id));
      
      // Actualización optimista
      queryClient.setQueryData(queryKeys.products.detail(id), (old: Product) => ({
        ...old,
        ...data,
      }));
      
      return { previousProduct };
    },
    onError: (_err, { id }, context) => {
      // Rollback en caso de error
      queryClient.setQueryData(queryKeys.products.detail(id), context?.previousProduct);
      toast.error('Error al actualizar producto');
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
    },
  });
}
```

---

## 🗄️ Base de Datos y Supabase

### Configuración de Supabase

```typescript
// src/shared/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'arte-guapinol',
    },
  },
});

// Helper para manejo de errores
export function handleSupabaseError(error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
  throw new Error('Unknown Supabase error');
}
```

### Estructura de Base de Datos Recomendada

```sql
-- Usuarios (manejado por Supabase Auth)
-- auth.users

-- Perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(10, 2) CHECK (cost >= 0),
  sku TEXT UNIQUE,
  category TEXT,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  min_stock INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ventas
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer', 'other')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items de venta
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidades)
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Generar tipos TypeScript
-- npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/shared/types/database.types.ts
```

### Service Layer Pattern

```typescript
// src/features/products/services/productService.ts
import { supabase, handleSupabaseError } from '@/shared/lib/supabase';
import type { Product, CreateProductDto, UpdateProductDto } from '../types/product.types';

class ProductService {
  private readonly table = 'products';

  async getProducts(filters?: { category?: string; isActive?: boolean }): Promise<Product[]> {
    try {
      let query = supabase
        .from(this.table)
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async createProduct(product: CreateProductDto): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async updateProduct(id: string, updates: UpdateProductDto): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .lte('stock', threshold)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
    }
  }
}

export const productService = new ProductService();
```

---

## 🎨 Componentes y UI

### Principios de Componentes Reutilizables

```typescript
// ✅ Componente base con props tipadas
import { type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/shared/lib/utils';

interface CardProps extends ComponentPropsWithoutRef<'div'> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg',
        {
          'bg-white': variant === 'default',
          'border border-gray-200': variant === 'bordered',
          'shadow-lg': variant === 'elevated',
        },
        {
          'p-0': padding === 'none',
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

### Compound Component Pattern

```typescript
// src/shared/components/data-display/DataTable/DataTable.tsx
import { createContext, useContext, type ReactNode } from 'react';

interface DataTableContextValue {
  hoverable?: boolean;
  striped?: boolean;
}

const DataTableContext = createContext<DataTableContextValue | undefined>(undefined);

function useDataTableContext() {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error('DataTable compound components must be used within DataTable');
  }
  return context;
}

interface DataTableProps {
  children: ReactNode;
  hoverable?: boolean;
  striped?: boolean;
}

export function DataTable({ children, hoverable, striped }: DataTableProps) {
  return (
    <DataTableContext.Provider value={{ hoverable, striped }}>
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </DataTableContext.Provider>
  );
}

DataTable.Header = function DataTableHeader({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-gray-50 border-b">
      <tr>{children}</tr>
    </thead>
  );
};

DataTable.Body = function DataTableBody({ children }: { children: ReactNode }) {
  const { hoverable, striped } = useDataTableContext();
  return (
    <tbody
      className={cn({
        '[&>tr:hover]:bg-gray-50': hoverable,
        '[&>tr:nth-child(even)]:bg-gray-50': striped,
      })}
    >
      {children}
    </tbody>
  );
};

DataTable.Row = function DataTableRow({ children }: { children: ReactNode }) {
  return <tr className="border-b">{children}</tr>;
};

DataTable.Cell = function DataTableCell({ children }: { children: ReactNode }) {
  return <td className="px-6 py-4">{children}</td>;
};

DataTable.HeaderCell = function DataTableHeaderCell({ children }: { children: ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
};

// Uso
<DataTable hoverable striped>
  <DataTable.Header>
    <DataTable.HeaderCell>Producto</DataTable.HeaderCell>
    <DataTable.HeaderCell>Precio</DataTable.HeaderCell>
  </DataTable.Header>
  <DataTable.Body>
    <DataTable.Row>
      <DataTable.Cell>Item 1</DataTable.Cell>
      <DataTable.Cell>$100</DataTable.Cell>
    </DataTable.Row>
  </DataTable.Body>
</DataTable>
```

### Render Props Pattern

```typescript
// src/shared/components/feedback/LoadingBoundary.tsx
import type { ReactNode } from 'react';

interface LoadingBoundaryProps<T> {
  isLoading: boolean;
  data: T | undefined;
  error?: Error | null;
  loadingFallback?: ReactNode;
  errorFallback?: (error: Error) => ReactNode;
  emptyFallback?: ReactNode;
  children: (data: T) => ReactNode;
}

export function LoadingBoundary<T>({
  isLoading,
  data,
  error,
  loadingFallback = <div>Cargando...</div>,
  errorFallback = (err) => <div>Error: {err.message}</div>,
  emptyFallback = <div>No hay datos</div>,
  children,
}: LoadingBoundaryProps<T>) {
  if (error) {
    return <>{errorFallback(error)}</>;
  }

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return <>{emptyFallback}</>;
  }

  return <>{children(data)}</>;
}

// Uso
function ProductsList() {
  const { data, isLoading, error } = useProducts();

  return (
    <LoadingBoundary
      isLoading={isLoading}
      data={data}
      error={error}
      loadingFallback={<ProductsSkeleton />}
      errorFallback={(err) => <ErrorAlert message={err.message} />}
      emptyFallback={<EmptyState message="No hay productos" />}
    >
      {(products) => products.map((product) => <ProductCard key={product.id} product={product} />)}
    </LoadingBoundary>
  );
}
```

### TanStack Table Integration

```typescript
// src/features/products/components/ProductsTable.tsx
import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import type { Product } from '../types/product.types';

interface ProductsTableProps {
  data: Product[];
}

export function ProductsTable({ data }: ProductsTableProps) {
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'category',
        header: 'Categoría',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'price',
        header: 'Precio',
        cell: (info) => `$${(info.getValue() as number).toFixed(2)}`,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: (info) => {
          const stock = info.getValue() as number;
          return (
            <span
              className={cn('font-medium', {
                'text-red-600': stock < 10,
                'text-yellow-600': stock >= 10 && stock < 50,
                'text-green-600': stock >= 50,
              })}
            >
              {stock}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => <ProductActions product={row.original} />,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            data.length
          )}{' '}
          de {data.length} resultados
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            variant="outline"
            size="sm"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 📐 Patrones y Mejores Prácticas

### Custom Hooks Pattern

```typescript
// src/shared/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// src/shared/hooks/useMediaQuery.ts
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Uso
function ProductSearch() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const { data: products } = useProducts({ search: debouncedSearch });
  
  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar productos..."
      />
      {isMobile ? <MobileProductList products={products} /> : <DesktopProductGrid products={products} />}
    </div>
  );
}
```

### Error Handling Pattern

```typescript
// src/shared/utils/errorHandler.ts
import { toast } from 'react-toastify';
import { PostgrestError } from '@supabase/supabase-js';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): AppError {
  console.error('Error:', error);

  // Supabase error
  if (isPostgrestError(error)) {
    const message = error.message || 'Error en la base de datos';
    toast.error(message);
    return new AppError(message, error.code, 500);
  }

  // Network error
  if (error instanceof TypeError && error.message.includes('fetch')) {
    const message = 'Error de conexión. Verifica tu internet.';
    toast.error(message);
    return new AppError(message, 'NETWORK_ERROR', 0);
  }

  // Generic error
  if (error instanceof Error) {
    toast.error(error.message);
    return new AppError(error.message);
  }

  // Unknown error
  const message = 'Ocurrió un error inesperado';
  toast.error(message);
  return new AppError(message, 'UNKNOWN_ERROR');
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}

// src/shared/components/feedback/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Algo salió mal</h2>
            <p className="text-gray-600">{this.state.error?.message}</p>
            <Button onClick={() => window.location.reload()}>Recargar página</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Form Handling con React Hook Form

```typescript
// src/features/products/components/ProductForm.tsx
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useCreateProduct } from '../hooks/useProductMutations';

const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  cost: z.number().positive('El costo debe ser mayor a 0').optional(),
  sku: z.string().optional(),
  category: z.string().min(1, 'Selecciona una categoría'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  min_stock: z.number().int().min(0).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductForm() {
  const createProduct = useCreateProduct();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stock: 0,
      min_stock: 0,
    },
  });

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    await createProduct.mutateAsync(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre del producto *</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Input id="description" {...register('description')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Precio *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
        </div>

        <div>
          <Label htmlFor="cost">Costo</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            {...register('cost', { valueAsNumber: true })}
          />
          {errors.cost && <p className="text-sm text-red-600">{errors.cost.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock">Stock inicial *</Label>
          <Input
            id="stock"
            type="number"
            {...register('stock', { valueAsNumber: true })}
          />
          {errors.stock && <p className="text-sm text-red-600">{errors.stock.message}</p>}
        </div>

        <div>
          <Label htmlFor="min_stock">Stock mínimo</Label>
          <Input
            id="min_stock"
            type="number"
            {...register('min_stock', { valueAsNumber: true })}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Guardando...' : 'Guardar producto'}
      </Button>
    </form>
  );
}
```

---

## ⚡ Performance y Optimización

### Code Splitting y Lazy Loading

```typescript
// src/app/router/routes.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { PageLoader } from '@/shared/components/feedback/PageLoader';

// Lazy load pages
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const Products = lazy(() => import('@/features/products/pages/Products'));
const ProductDetail = lazy(() => import('@/features/products/pages/ProductDetail'));
const Sales = lazy(() => import('@/features/sales/pages/Sales'));
const Customers = lazy(() => import('@/features/customers/pages/Customers'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <Products />
              </Suspense>
            ),
          },
          {
            path: ':id',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProductDetail />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'sales',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Sales />
          </Suspense>
        ),
      },
      {
        path: 'customers',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Customers />
          </Suspense>
        ),
      },
    ],
  },
]);
```

### Optimización de Imágenes

```typescript
// src/shared/components/data-display/OptimizedImage.tsx
import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: 'square' | '16/9' | '4/3' | '3/2';
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder-image.png',
  aspectRatio,
  className,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-100',
        {
          'aspect-square': aspectRatio === 'square',
          'aspect-video': aspectRatio === '16/9',
          'aspect-[4/3]': aspectRatio === '4/3',
          'aspect-[3/2]': aspectRatio === '3/2',
        },
        className
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc);
          setIsLoading(false);
        }}
        className={cn('h-full w-full object-cover transition-opacity', {
          'opacity-0': isLoading,
          'opacity-100': !isLoading,
        })}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
```

### Memoization

```typescript
// ✅ Usar React.memo para componentes puros
import { memo } from 'react';

interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ProductCard = memo(function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <Card>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <Button onClick={() => onEdit(product.id)}>Editar</Button>
      <Button onClick={() => onDelete(product.id)}>Eliminar</Button>
    </Card>
  );
});

// ✅ Usar useMemo para cálculos costosos
function SalesReport({ sales }: { sales: Sale[] }) {
  const totalRevenue = useMemo(() => {
    return sales.reduce((sum, sale) => sum + sale.total, 0);
  }, [sales]);

  const averageTicket = useMemo(() => {
    if (sales.length === 0) return 0;
    return totalRevenue / sales.length;
  }, [totalRevenue, sales.length]);

  return (
    <div>
      <p>Total: ${totalRevenue.toFixed(2)}</p>
      <p>Promedio: ${averageTicket.toFixed(2)}</p>
    </div>
  );
}

// ✅ Usar useCallback para funciones que se pasan como props
function ProductsList() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []); // Sin dependencias, la función es estable

  const handleEdit = useCallback((id: string) => {
    // lógica de edición
  }, []); // Sin dependencias externas

  return (
    <div>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={handleSelect}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
}
```

### Virtual Scrolling (para listas grandes)

```typescript
// src/shared/components/data-display/VirtualList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
}

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 50,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Uso
<VirtualList
  items={products}
  renderItem={(product) => <ProductCard key={product.id} product={product} />}
  estimateSize={100}
/>
```

### Configuración de Vite para Producción

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Generar sourcemaps solo en desarrollo
    sourcemap: false,
    // Optimizar tamaño de chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendors grandes
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'data-vendor': ['@tanstack/react-query', '@tanstack/react-table'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // Aumentar el límite de advertencia de tamaño de chunk
    chunkSizeWarningLimit: 1000,
    // Minificar con terser para mejor optimización
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.logs en producción
        drop_debugger: true,
      },
    },
  },
  // Optimizar dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
});
```

---

## 🎨 UX/UI Guidelines

### 10 Heurísticas de Usabilidad de Nielsen

#### 1. Visibilidad del Estado del Sistema

```typescript
// ✅ Mostrar siempre el estado de las operaciones
function ProductsList() {
  const { data, isLoading, error } = useProducts();
  const deleteProduct = useDeleteProduct();

  if (isLoading) {
    return <LoadingSpinner message="Cargando productos..." />;
  }

  if (error) {
    return <ErrorAlert message="Error al cargar productos" />;
  }

  return (
    <div>
      {deleteProduct.isPending && (
        <Toast type="info" message="Eliminando producto..." />
      )}
      {/* ... rest of component */}
    </div>
  );
}
```

#### 2. Coincidencia entre el Sistema y el Mundo Real

```typescript
// ✅ Usar lenguaje familiar y natural
const messages = {
  deleteConfirm: '¿Estás seguro de eliminar este producto?', // No: "Confirmar operación de eliminación"
  saveSuccess: 'Producto guardado exitosamente', // No: "Operación completada con éxito"
  lowStock: 'Stock bajo', // No: "Nivel de inventario por debajo del umbral"
};

// ✅ Ordenar fechas de forma natural
const formatDate = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return date.toLocaleDateString('es-ES');
};
```

#### 3. Control y Libertad del Usuario

```typescript
// ✅ Permitir deshacer acciones
function SaleForm() {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [deletedItems, setDeletedItems] = useState<SaleItem[]>([]);

  const removeItem = (index: number) => {
    const item = items[index];
    setDeletedItems((prev) => [...prev, item]);
    setItems((prev) => prev.filter((_, i) => i !== index));
    
    toast.info(
      <div>
        Item eliminado
        <Button onClick={() => undoRemove(item)} size="sm">
          Deshacer
        </Button>
      </div>
    );
  };

  const undoRemove = (item: SaleItem) => {
    setItems((prev) => [...prev, item]);
    setDeletedItems((prev) => prev.filter((i) => i !== item));
    toast.dismiss();
  };

  return (/* ... */);
}

// ✅ Permitir cancelar operaciones
function ProductForm() {
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);

  const handleCancel = () => {
    if (isDirty) {
      if (confirm('¿Descartar cambios?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  return (/* ... */);
}
```

#### 4. Consistencia y Estándares

```typescript
// ✅ Usar el mismo patrón para todas las acciones CRUD
// src/shared/constants/actionPatterns.ts
export const ACTION_PATTERNS = {
  create: {
    buttonText: 'Crear',
    successMessage: (entity: string) => `${entity} creado exitosamente`,
    errorMessage: (entity: string) => `Error al crear ${entity}`,
  },
  update: {
    buttonText: 'Guardar',
    successMessage: (entity: string) => `${entity} actualizado exitosamente`,
    errorMessage: (entity: string) => `Error al actualizar ${entity}`,
  },
  delete: {
    buttonText: 'Eliminar',
    confirmMessage: (entity: string) => `¿Estás seguro de eliminar este ${entity}?`,
    successMessage: (entity: string) => `${entity} eliminado exitosamente`,
    errorMessage: (entity: string) => `Error al eliminar ${entity}`,
  },
} as const;

// ✅ Colores consistentes para estados
export const STATUS_COLORS = {
  success: 'text-green-600 bg-green-50',
  warning: 'text-yellow-600 bg-yellow-50',
  error: 'text-red-600 bg-red-50',
  info: 'text-blue-600 bg-blue-50',
} as const;
```

#### 5. Prevención de Errores

```typescript
// ✅ Validación en tiempo real
function ProductForm() {
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');

  const profitMargin = useMemo(() => {
    const p = parseFloat(price);
    const c = parseFloat(cost);
    if (isNaN(p) || isNaN(c) || c === 0) return null;
    return ((p - c) / c) * 100;
  }, [price, cost]);

  return (
    <div>
      <Input
        label="Precio de venta"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        type="number"
      />
      <Input
        label="Costo"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        type="number"
      />
      {profitMargin !== null && profitMargin < 0 && (
        <Alert type="warning">
          ⚠️ El precio de venta es menor que el costo. Margen: {profitMargin.toFixed(1)}%
        </Alert>
      )}
    </div>
  );
}

// ✅ Confirmación para acciones destructivas
function DeleteProductButton({ productId }: { productId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteProduct = useDeleteProduct();

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Eliminar</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El producto será eliminado permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteProduct.mutate(productId)}
            className="bg-red-600 hover:bg-red-700"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

#### 6. Reconocimiento vs Recuerdo

```typescript
// ✅ Usar autocomplete y sugerencias
function CustomerSelect() {
  const [query, setQuery] = useState('');
  const { data: customers } = useCustomers({ search: query });

  return (
    <Combobox value={selected} onChange={setSelected}>
      <ComboboxInput
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar o crear cliente..."
      />
      <ComboboxOptions>
        {customers?.map((customer) => (
          <ComboboxOption key={customer.id} value={customer}>
            <div className="flex items-center gap-2">
              <Avatar src={customer.avatar} />
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>
            </div>
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  );
}

// ✅ Mostrar historial reciente
function ProductSearch() {
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recent-searches', []);

  return (
    <div>
      <Input placeholder="Buscar producto..." />
      {recentSearches.length > 0 && (
        <div>
          <p className="text-sm text-gray-500">Búsquedas recientes:</p>
          {recentSearches.map((search) => (
            <button key={search} onClick={() => handleSearch(search)}>
              {search}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 7. Flexibilidad y Eficiencia de Uso

```typescript
// ✅ Atajos de teclado
function ProductsPage() {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N para nuevo producto
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        openNewProductModal();
      }
      // Ctrl/Cmd + F para buscar
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        focusSearchInput();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (/* ... */);
}

// ✅ Acciones rápidas
function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <div>{product.name}</div>
      <DropdownMenu>
        <DropdownMenuTrigger>•••</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Editar (E)
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy className="mr-2 h-4 w-4" />
            Duplicar (D)
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Eliminar (Del)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}
```

#### 8. Diseño Estético y Minimalista

```typescript
// ✅ Mostrar solo información relevante
function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <OptimizedImage
            src={product.image_url}
            alt={product.name}
            className="h-16 w-16 rounded"
          />
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold">${product.price}</p>
          <p className="text-sm text-gray-500">Stock: {product.stock}</p>
        </div>
      </div>
    </Card>
  );
}

// ❌ MAL - Demasiada información
function BadProductCard({ product }: { product: Product }) {
  return (
    <Card className="p-4">
      <div>
        <p>ID: {product.id}</p>
        <p>Nombre: {product.name}</p>
        <p>Descripción: {product.description}</p>
        <p>Precio: ${product.price}</p>
        <p>Costo: ${product.cost}</p>
        <p>SKU: {product.sku}</p>
        <p>Categoría: {product.category}</p>
        <p>Stock: {product.stock}</p>
        <p>Stock mínimo: {product.min_stock}</p>
        <p>Creado: {product.created_at}</p>
        <p>Actualizado: {product.updated_at}</p>
      </div>
    </Card>
  );
}
```

#### 9. Ayuda a Reconocer, Diagnosticar y Recuperarse de Errores

```typescript
// ✅ Mensajes de error útiles y accionables
function ErrorAlert({ error }: { error: Error }) {
  const getErrorInfo = () => {
    if (error.message.includes('network')) {
      return {
        title: 'Error de conexión',
        description: 'No pudimos conectar con el servidor.',
        action: 'Verifica tu conexión a internet e intenta nuevamente.',
        actionButton: <Button onClick={() => window.location.reload()}>Reintentar</Button>,
      };
    }

    if (error.message.includes('unauthorized')) {
      return {
        title: 'Sesión expirada',
        description: 'Tu sesión ha caducado.',
        action: 'Por favor, inicia sesión nuevamente.',
        actionButton: <Button onClick={() => navigate('/login')}>Iniciar sesión</Button>,
      };
    }

    return {
      title: 'Error inesperado',
      description: error.message,
      action: 'Intenta nuevamente o contacta a soporte si el problema persiste.',
      actionButton: <Button onClick={() => window.location.reload()}>Reintentar</Button>,
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{errorInfo.title}</AlertTitle>
      <AlertDescription>
        <p>{errorInfo.description}</p>
        <p className="mt-2 text-sm">{errorInfo.action}</p>
        <div className="mt-4">{errorInfo.actionButton}</div>
      </AlertDescription>
    </Alert>
  );
}
```

#### 10. Ayuda y Documentación

```typescript
// ✅ Integrar Driver.js para onboarding
// src/features/onboarding/useOnboarding.ts
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useOnboarding() {
  const startProductsTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: '#search-input',
          popover: {
            title: 'Buscar productos',
            description: 'Usa este campo para buscar productos por nombre, SKU o categoría',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#new-product-btn',
          popover: {
            title: 'Crear producto',
            description: 'Haz clic aquí para agregar un nuevo producto a tu inventario',
            side: 'bottom',
          },
        },
        {
          element: '#product-filters',
          popover: {
            title: 'Filtros',
            description: 'Filtra productos por categoría, stock o estado',
            side: 'left',
          },
        },
      ],
    });

    driverObj.drive();
  };

  return { startProductsTour };
}

// ✅ Tooltips contextuales
function LowStockBadge({ stock, minStock }: { stock: number; minStock: number }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="warning">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Stock bajo
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Stock actual: {stock}</p>
        <p>Stock mínimo: {minStock}</p>
        <p className="mt-2 text-xs">Considera reabastecer pronto</p>
      </TooltipContent>
    </Tooltip>
  );
}
```

### Leyes de UX Aplicadas

#### Ley de Hick

```typescript
// ✅ Reducir opciones para decisiones más rápidas
function QuickSaleActions() {
  return (
    <div className="flex gap-2">
      <Button variant="primary">Completar venta</Button>
      <Button variant="outline">Guardar borrador</Button>
      {/* Solo las 2 acciones más comunes */}
    </div>
  );
}

// ❌ MAL - Demasiadas opciones
function BadSaleActions() {
  return (
    <div className="flex gap-2">
      <Button>Completar</Button>
      <Button>Borrador</Button>
      <Button>Enviar</Button>
      <Button>Imprimir</Button>
      <Button>Compartir</Button>
      <Button>Exportar</Button>
      {/* Usuario confundido */}
    </div>
  );
}
```

#### Ley de Fitts

```typescript
// ✅ Botones grandes para acciones importantes
function PrimaryActions() {
  return (
    <Button
      size="lg" // Más fácil de clickear
      className="w-full md:w-auto md:px-8" // Grande en móvil, adecuado en desktop
    >
      Crear venta
    </Button>
  );
}

// ✅ Agrupar elementos relacionados cerca
function ProductActions({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-2">
      {/* Acciones relacionadas juntas */}
      <Button size="sm" variant="outline">
        <Edit className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="outline">
        <Copy className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="destructive">
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

#### Ley de Miller (7±2)

```typescript
// ✅ Agrupar información en chunks
function ProductDetails({ product }: { product: Product }) {
  return (
    <div className="grid gap-6">
      {/* Información básica (1 chunk) */}
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Nombre</dt>
              <dd className="font-medium">{product.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">SKU</dt>
              <dd className="font-medium">{product.sku}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Precios (1 chunk) */}
      <Card>
        <CardHeader>
          <CardTitle>Precios</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Precio de venta</dt>
              <dd className="font-medium">${product.price}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Costo</dt>
              <dd className="font-medium">${product.cost}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Inventario (1 chunk) */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Stock actual</dt>
              <dd className="font-medium">{product.stock}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Stock mínimo</dt>
              <dd className="font-medium">{product.min_stock}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Responsive Design

```typescript
// src/shared/hooks/useResponsive.ts
export function useResponsive() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  return { isMobile, isTablet, isDesktop };
}

// Uso en componentes
function ProductsGrid() {
  const { isMobile, isTablet } = useResponsive();

  const columns = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <div className={`grid gap-4 grid-cols-${columns}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// O con Tailwind directamente
function ResponsiveLayout() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Contenido */}
    </div>
  );
}
```

---

## ✅ Testing y Calidad

### Configuración de Testing (opcional pero recomendado)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

### Unit Tests Ejemplo

```typescript
// src/shared/utils/__tests__/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '../formatters';

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-100)).toBe('-$100.00');
  });
});

// src/features/products/hooks/__tests__/useProducts.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { useProducts } from '../useProducts';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProducts', () => {
  it('should fetch products successfully', async () => {
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

### ESLint y Prettier

```json
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

---

## 📋 Checklist de Desarrollo

### Antes de Empezar

- [ ] Configurar variables de entorno (`.env.local`)
- [ ] Generar tipos de Supabase (`npx supabase gen types typescript`)
- [ ] Configurar ESLint y Prettier
- [ ] Configurar Git hooks (husky) si es necesario
- [ ] Revisar este documento completo

### Durante el Desarrollo

#### Por Cada Feature

- [ ] Crear estructura de carpetas según la arquitectura
- [ ] Definir tipos TypeScript primero
- [ ] Crear service layer para interacción con Supabase
- [ ] Crear custom hooks con TanStack Query
- [ ] Implementar componentes con composición
- [ ] Agregar manejo de errores
- [ ] Agregar loading states
- [ ] Agregar empty states
- [ ] Validar formularios con Zod
- [ ] Agregar notificaciones (react-toastify)
- [ ] Implementar responsive design
- [ ] Optimizar performance (memo, useMemo, useCallback cuando sea necesario)
- [ ] Agregar accesibilidad (aria-labels, keyboard navigation)

#### Code Review Checklist

- [ ] ¿El código sigue SOLID?
- [ ] ¿Los componentes son reutilizables?
- [ ] ¿Hay separación clara de responsabilidades?
- [ ] ¿Los nombres son descriptivos?
- [ ] ¿Hay manejo de errores apropiado?
- [ ] ¿Hay validación de datos?
- [ ] ¿El código es testeable?
- [ ] ¿Se siguen las convenciones del proyecto?
- [ ] ¿Hay comentarios donde sea necesario?
- [ ] ¿Se evitan dependencias innecesarias?

### Antes de Deploy

- [ ] Ejecutar build de producción (`npm run build`)
- [ ] Verificar que no hay errores de TypeScript
- [ ] Verificar que no hay errores de ESLint
- [ ] Probar en diferentes navegadores
- [ ] Probar en diferentes tamaños de pantalla
- [ ] Verificar performance (Lighthouse)
- [ ] Verificar que las variables de entorno están configuradas
- [ ] Revisar políticas de RLS en Supabase
- [ ] Hacer backup de la base de datos
- [ ] Documentar cambios importantes

---

## 🔐 Seguridad

### Best Practices de Seguridad

```typescript
// ✅ Nunca exponer claves sensibles
// .env.local (NUNCA commitear este archivo)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

// ✅ Validar input del usuario
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  // Sanitizar HTML si es necesario
  description: z.string().max(1000).transform((val) => sanitizeHtml(val)),
});

// ✅ Implementar RLS (Row Level Security) en Supabase
/*
-- Ejemplo de política RLS
CREATE POLICY "Users can only see their own sales"
ON sales FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own sales"
ON sales FOR INSERT
WITH CHECK (auth.uid() = created_by);
*/

// ✅ Proteger rutas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) return <Loader />;
  if (!user) return null;

  return <>{children}</>;
}

// ✅ Sanitizar datos antes de mostrar
import DOMPurify from 'dompurify';

function SafeHTML({ html }: { html: string }) {
  const sanitizedHtml = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Table](https://tanstack.com/table/latest)
- [Supabase](https://supabase.com/docs)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Driver.js](https://driverjs.com/)

### Patrones y Arquitectura

- [React Design Patterns](https://www.patterns.dev/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

### UX/UI

- [Nielsen Norman Group](https://www.nngroup.com/)
- [Laws of UX](https://lawsofux.com/)
- [Material Design](https://material.io/design)

---

## 🎯 Preguntas Frecuentes

### ¿Cuándo usar Zustand vs TanStack Query?

- **Zustand**: Estado de la UI (sidebar abierto/cerrado, tema, preferencias)
- **TanStack Query**: Estado del servidor (productos, ventas, clientes)

### ¿Cuándo crear un custom hook?

- Cuando la lógica se reutiliza en 2+ componentes
- Cuando la lógica es compleja y merece separación
- Para encapsular llamadas a APIs

### ¿Cuándo usar memo/useMemo/useCallback?

- **memo**: Componentes que reciben props complejas y renderean frecuentemente
- **useMemo**: Cálculos costosos que dependen de ciertas dependencias
- **useCallback**: Funciones que se pasan como props a componentes memoizados

**Regla**: Mide primero, optimiza después. No optimices prematuramente.

---

## 🚀 Conclusión

Este documento es una guía viva que debe evolucionar con el proyecto. Recuerda:

1. **SOLID es tu amigo**: Componentes pequeños, responsabilidades claras
2. **El usuario primero**: UX/UI no es opcional
3. **Performance matters**: Pero no optimices prematuramente
4. **Consistencia**: Sigue los patrones establecidos
5. **Documenta**: El código se lee más veces de las que se escribe

**¡Éxito con Arte Guapinol! 🎨🚀**

---

## 📝 Notas de Versión

- **v1.0.0** (2024): Versión inicial del documento
- Próximas actualizaciones: Agregar patrones de testing, CI/CD, deployment

---

**Última actualización:** ${new Date().toLocaleDateString('es-ES')}
**Mantenido por:** Equipo de Desarrollo Arte Guapinol