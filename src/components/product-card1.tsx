import Image from 'next/image';
import Link from 'next/link';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IProduct } from '@/types/products.type';

interface ProductCard1Props {
  product: IProduct;
  isFeatured?: boolean;
}

const ProductCard1 = ({ product, isFeatured }: ProductCard1Props) => {
  const salePrice = product.specialPrice ?? product.price;
  const hasDiscount =
    (product.discount && product.discount > 0) ||
    (product.specialPrice != null && product.specialPrice < product.price);

  const discountPercent =
    product.discount && product.discount > 0
      ? product.discount
      : product.specialPrice && product.price
        ? Math.round(
            ((product.price - product.specialPrice) / product.price) * 100,
          )
        : 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-slate-900  shadow-xs  flex flex-col justify-between p-0 ">
        {/* IMAGE CONTAINER (FLUSH TO EDGES WITH NO TOP GAP) */}
        <div className="relative w-full overflow-hidden bg-gray-100 dark:bg-slate-800">
          <AspectRatio ratio={1.15} className="w-full">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xs font-medium text-gray-400">
                  No Image
                </span>
              </div>
            )}
          </AspectRatio>

          {/* FEATURED BADGE */}
          {isFeatured && (
            <Badge className="absolute top-2.5 left-2.5 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full border-0 shadow-xs">
              Featured
            </Badge>
          )}

          {/* DISCOUNT BADGE */}
          {hasDiscount && discountPercent > 0 && (
            <Badge className="absolute top-2.5 right-2.5 bg-rose-500 text-white font-bold text-[11px] px-2 py-0.5 rounded-full border-0 shadow-xs">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* CONTENT DETAILS */}
        <CardContent className="p-3.5 flex flex-col flex-1 justify-between gap-2.5 text-center">
          <div className="space-y-1">
            {/* PRODUCT NAME */}
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="space-y-1.5 pt-1">
            {/* PRICE */}
            <div className="flex items-baseline justify-center gap-1.5 pt-0.5">
              <span className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                ৳{salePrice.toLocaleString('en-BD')}
              </span>

              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  ৳{product.price.toLocaleString('en-BD')}
                </span>
              )}
            </div>
            {/* ORDER NOW */}{' '}
            <div className="w-full rounded-md bg-primary py-2 text-center text-xs sm:text-sm font-semibold text-primary-foreground transition-all duration-200 group-hover:bg-primary/90">
              অর্ডার করুন{' '}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export { ProductCard1 };
