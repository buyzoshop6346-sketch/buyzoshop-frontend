import { Order, OrderItem as OrderItemType } from '@/types/orders';
import Image from 'next/image';

interface OrderItemsProps {
  order: Order;
}

const OrderItems = ({ order }: OrderItemsProps) => {
  return (
    <section className="mt-6 rounded-sm border bg-background">
      <div className="border-b p-5">
        <h2 className="text-lg font-semibold">Order Items</h2>
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
            </tr>
          </thead>

          <tbody className="divide-y">
            {order.items?.map((item: OrderItemType) => {
              const productPrice = Number(
                item.product?.specialPrice ?? item.product?.price ?? item.price,
              );

              const subtotal = productPrice * item.quantity;

              return (
                <tr key={item.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {item.product?.thumbnail && (
                        <Image
                          src={item.product.thumbnail}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-sm border object-cover"
                        />
                      )}

                      <div>
                        <p className="max-w-[300px] font-medium">{item.name}</p>

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
                    ৳{productPrice.toLocaleString()}
                  </td>

                  <td className="px-5 py-4 text-right font-medium">
                    ৳{subtotal.toLocaleString()}
                  </td>

                  <td className="px-5 py-4 text-center">
                    {item.product?.stock ?? '-'}
                  </td>
                </tr>
              );
            })}

            {!order.items?.length && (
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
  );
};

export default OrderItems;
