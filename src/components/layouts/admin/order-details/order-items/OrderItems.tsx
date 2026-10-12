/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Plus,
  X,
  Package,
  Loader2,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Order, OrderItem as OrderItemType } from '@/types/orders';
import { getProducts } from '@/services/product.service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  addProductToOrder,
  getOrderById,
  removeProductFromOrder,
} from '@/services/orders.service';

interface OrderItemsProps {
  order: Order;
}

interface Product {
  id: string;
  name: string;
  thumbnail?: string | null;
  price: number;
  specialPrice?: number | null;
  stock?: number;
  brand?: string | null;
}

const OrderItems = ({ order }: OrderItemsProps) => {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);

  const [showProducts, setShowProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshingOrder, setRefreshingOrder] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Keep local order data in sync with parent props.
  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  // Fetch products when the section opens or search changes.
  useEffect(() => {
    if (!showProducts) return;

    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await getProducts({
          page: 1,
          limit: 100,
          search: search.trim() || undefined,
        });

        const productList = response?.data?.data;

        if (!cancelled) {
          setProducts(Array.isArray(productList) ? productList : []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch products:', error);
          toast.error('Failed to load products.');
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchProducts, search.trim() ? 400 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [showProducts, search]);

  // Refresh the order after adding a product.
  const refreshOrder = useCallback(async () => {
    setRefreshingOrder(true);

    try {
      const response = await getOrderById(currentOrder.id);

      // Supports both direct order data and a nested API response.
      const updatedOrder = response?.data?.data ?? response?.data;

      if (updatedOrder?.id) {
        setCurrentOrder(updatedOrder as Order);
      }
    } catch (error) {
      console.error('Failed to refresh order:', error);
      toast.warning(
        'Product was added, but refreshing the order failed. Reload the order details.',
      );
    } finally {
      setRefreshingOrder(false);
    }
  }, [currentOrder.id]);

  // Add product to the existing order.
  const handleAddProduct = async (product: Product) => {
    if (selectedProductId) return;

    if (product.stock !== undefined && product.stock <= 0) {
      toast.error('This product is out of stock.');
      return;
    }

    try {
      setSelectedProductId(product.id);

      await addProductToOrder(currentOrder.id, {
        productId: product.id,
        quantity: 1,
      });

      toast.success(`${product.name} added to the order successfully.`);

      // Refresh order items and total from the backend.
      await refreshOrder();

      // Refresh product stock in the selection table.
      const response = await getProducts({
        page: 1,
        limit: 100,
        search: search.trim() || undefined,
      });

      const productList = response?.data?.data;

      if (Array.isArray(productList)) {
        setProducts(productList);
      }
    } catch (error: any) {
      console.error('Failed to add product:', error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to add product to the order.';

      toast.error(message);
    } finally {
      setSelectedProductId(null);
    }
  };

  const handleRemoveProduct = async (item: OrderItemType) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${item.name}" from this order?`,
    );

    if (!confirmed) return;

    try {
      setDeletingItemId(item.id);

      await removeProductFromOrder(currentOrder.id, item.id);

      toast.success(`${item.name} removed from order.`);

      await refreshOrder();
    } catch (error: any) {
      console.error('Failed to remove product:', error);

      toast.error(
        error?.response?.data?.message ||
          'Failed to remove product from order.',
      );
    } finally {
      setDeletingItemId(null);
    }
  };

  return (
    <div className="mt-6 space-y-5">
      {/* ORDER ITEMS TABLE */}
      <section className="rounded-sm border bg-background">
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Order Items</h2>
            <p className="text-sm text-muted-foreground">
              Manage products in this order
            </p>
          </div>

          <div className="flex items-center gap-3">
            {refreshingOrder && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}

            <Button
              onClick={() => setShowProducts(previous => !previous)}
              className="gap-2"
            >
              {showProducts ? (
                <>
                  <X className="h-4 w-4" />
                  Close Products
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-5 py-3 text-left">Product</th>
                <th className="px-5 py-3 text-left">Color</th>
                <th className="px-5 py-3 text-left">Size</th>
                <th className="px-5 py-3 text-center">Quantity</th>
                <th className="px-5 py-3 text-right">Price</th>
                <th className="px-5 py-3 text-right">Subtotal</th>
                <th className="px-5 py-3 text-center">Current Stock</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {currentOrder.items?.map((item: OrderItemType) => {
                return (
                  <tr key={item.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.product?.thumbnail ? (
                          <Image
                            src={item.product.thumbnail}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-sm border object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-sm border bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}

                        <div>
                          <p className="max-w-[300px] font-medium">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.product?.brand || '-'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">{item.color || '-'}</td>
                    <td className="px-5 py-4">{item.size || '-'}</td>
                    <td className="px-5 py-4 text-center">{item.quantity}</td>

                    <td className="px-5 py-4 text-right">
                      ৳{Number(item.price).toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-right font-medium">
                      ৳{(Number(item.price) * item.quantity).toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-center">
                      {item.product?.stock ?? '-'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingItemId !== null}
                        onClick={() => handleRemoveProduct(item)}
                        className="gap-1"
                      >
                        {deletingItemId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {!currentOrder.items?.length && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-muted-foreground"
                  >
                    No order items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ADD PRODUCT SECTION */}
      <AnimatePresence initial={false}>
        {showProducts && (
          <motion.section
            key="add-products-section"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border bg-background">
              <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">Select a Product</h2>
                    <p className="text-sm text-muted-foreground">
                      Find a product to add to this order
                    </p>
                  </div>
                </div>

                <span className="text-sm text-muted-foreground">
                  {products.length} products found
                </span>
              </div>

              <div className="border-b p-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Search products by name..."
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="px-5 py-3 text-left">Product</th>
                      <th className="px-5 py-3 text-right">Price</th>
                      <th className="px-5 py-3 text-center">Stock</th>
                      <th className="px-5 py-3 text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-12">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading products...</span>
                          </div>
                        </td>
                      </tr>
                    ) : products.length > 0 ? (
                      products.map((product, index) => {
                        const price = Number(
                          product.specialPrice ?? product.price ?? 0,
                        );

                        const outOfStock =
                          product.stock !== undefined && product.stock <= 0;

                        return (
                          <motion.tr
                            key={product.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.2,
                              delay: Math.min(index * 0.03, 0.2),
                            }}
                            className="hover:bg-muted/30"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {product.thumbnail ? (
                                  <Image
                                    src={product.thumbnail}
                                    alt={product.name}
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 shrink-0 rounded-md border object-cover"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-muted">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}

                                <div>
                                  <p className="max-w-[350px] font-medium">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {product.brand || '-'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right font-medium">
                              ৳{price.toLocaleString()}
                            </td>

                            <td className="px-5 py-4 text-center">
                              <span
                                className={
                                  outOfStock
                                    ? 'font-medium text-red-500'
                                    : 'text-muted-foreground'
                                }
                              >
                                {product.stock ?? '-'}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-center">
                              <Button
                                size="sm"
                                disabled={
                                  selectedProductId !== null || outOfStock
                                }
                                onClick={() => handleAddProduct(product)}
                                className="gap-1"
                              >
                                {selectedProductId === product.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4" />
                                    Add
                                  </>
                                )}
                              </Button>
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-5 py-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <Package className="mb-3 h-10 w-10 text-muted-foreground" />
                            <p className="font-medium">No products found</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Try searching with another product name.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderItems;
