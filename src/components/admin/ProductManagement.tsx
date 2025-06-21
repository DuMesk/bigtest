import { useState } from 'react';
import { useProductStore } from '../../lib/store';
import { Plus, Trash, Edit, X, Save, Image as ImageIcon } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  image_url: string;
  stock: string;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  stock: '',
};

export const ProductManagement = () => {
  const { products, loading, error, fetchProducts, addProduct, deleteProduct, updateProduct } = useProductStore();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image_url: formData.image_url,
      stock: parseInt(formData.stock),
    };

    if (editingProduct) {
      await updateProduct(editingProduct, productData);
      setEditingProduct(null);
    } else {
      await addProduct(productData);
      setIsAddingProduct(false);
    }

    setFormData(initialFormData);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      await deleteProduct(id);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url,
      stock: product.stock.toString(),
    });
  };

  const ProductForm = () => (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">Nome do Produto</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full border rounded p-2 dark:bg-slate-600 dark:text-white dark:border-slate-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">Preço (R$)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            step="0.01"
            min="0"
            className="w-full border rounded p-2 dark:bg-slate-600 dark:text-white dark:border-slate-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">URL da Imagem</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleInputChange}
            required
            className="w-full border rounded p-2 dark:bg-slate-600 dark:text-white dark:border-slate-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">Estoque</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            required
            min="0"
            className="w-full border rounded p-2 dark:bg-slate-600 dark:text-white dark:border-slate-500"
          />
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1 dark:text-white">Descrição</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={3}
          className="w-full border rounded p-2 dark:bg-slate-600 dark:text-white dark:border-slate-500"
        />
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={() => {
            setIsAddingProduct(false);
            setEditingProduct(null);
            setFormData(initialFormData);
          }}
          className="btn btn-outline py-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary py-2"
        >
          {editingProduct ? 'Salvar Alterações' : 'Adicionar Produto'}
        </button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading-md dark:text-white">Gerenciar Produtos</h2>
        {!isAddingProduct && !editingProduct && (
          <button
            onClick={() => setIsAddingProduct(true)}
            className="btn btn-primary py-2"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Produto
          </button>
        )}
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 text-error p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {(isAddingProduct || editingProduct) && <ProductForm />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-9 relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-slate-400" />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 dark:text-white">{product.name}</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-2 line-clamp-2">
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-accent">
                  R$ {product.price.toFixed(2)}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-300">
                  Estoque: {product.stock}
                </span>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-accent"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-error"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="dark:text-white">Carregando produtos...</p>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-300">
            Nenhum produto cadastrado ainda.
          </p>
        </div>
      )}
    </div>
  );
};