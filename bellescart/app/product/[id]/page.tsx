'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import { Product, ProductImage, ProductCategory } from '@/utils/types';
import Link from 'next/link';
import { useRequireUserAuth } from '@/auth/user';
import { globalToast } from '@/utils/globalToast';
import { useProduct } from '@/hooks/user/useProductQueries';
import { useCart as useCartQuery, useAddToCart, useUpdateCartItem } from '@/hooks/user/useCartQueries';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;
  const { user, loaded, isAuthenticated } = useRequireUserAuth();

  // React Query hooks
  const { data: productData, isLoading: isLoadingProduct } = useProduct(productId);
  const { data: cartData } = useCartQuery();
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Process product data from React Query
  const product = React.useMemo(() => {
    if (!productData?.data) return null;
    const productDataItem = productData.data.product || productData.data.products?.[0];
    return productDataItem || null;
  }, [productData]);

  // Process cart data from React Query
  const cartItems = React.useMemo(() => {
    return cartData?.data?.items || [];
  }, [cartData]);

  // Set selected image when product loads
  useEffect(() => {
    if (product) {
      const mainImage = product.images?.find((img: ProductImage) => img.isMain)?.url || product.images?.[0]?.url || null;
      setSelectedImage(mainImage);
    }
  }, [product]);

  // Check if product is in cart
  const cartItem = React.useMemo(() => {
    if (!product) return null;
    // Cart items structure: items have product nested with all product data
    return cartItems.find((item: any) => {
      const productIdInCart = item.product?._id || item.productId;
      return productIdInCart === product._id;
    }) || null;
  }, [product, cartItems]);

  const isInCart = !!cartItem;
  const cartItemId = cartItem?._id || null;
  const cartQuantity = cartItem?.quantity || 0;

  // Set quantity based on cart
  useEffect(() => {
    if (isInCart && cartQuantity > 0) {
      setQuantity(cartQuantity);
    } else {
      setQuantity(1);
    }
  }, [isInCart, cartQuantity]);

  // Show loader while checking authentication
  if (!loaded) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Loading..." />
        </div>
        <Footer />
      </div>
    );
  }

  // Don't render if not authenticated (should be handled by useRequireUserAuth redirect)
  if (!isAuthenticated) {
    return null;
  }

  const handleAddToCart = async () => {
    if (product) {
      try {
        if (isInCart && cartItemId) {
          // Update existing cart item using React Query mutation
          await updateCartItemMutation.mutateAsync({ itemId: cartItemId, request: { quantity } });
          globalToast.cart.quantityUpdated();
        } else {
          // Add new item to cart using React Query mutation
          await addToCartMutation.mutateAsync({ productId: product._id, quantity });
          globalToast.cart.addSuccess();
        }
      } catch (error) {
        console.error('Failed to add/update cart:', error);
        globalToast.cart.addFailed();
      }
    }
  };

  const handleAddToWishlist = () => {
    if (product) {
      console.log('Add to wishlist:', product);
      // TODO: Implement wishlist functionality for authenticated users
    }
  };

  // Show loader while checking authentication or loading product
  if (!loaded || isLoadingProduct) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text={!loaded ? "Checking authentication..." : "Loading product..."} fullScreen />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/products')}>
              Back to Products
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercent = (product as any).originalPrice
    ? Math.round((((product as any).originalPrice - product.price) / (product as any).originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <main className="flex-1">
        {/* Enhanced Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-pink-600 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <span className="text-gray-300">/</span>
              <Link href="/products" className="text-gray-500 hover:text-pink-600 transition-colors">Products</Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Enhanced Product Images */}
            <div className="space-y-6">
              <div className="relative aspect-[4/5] bg-white rounded-3xl shadow-xl overflow-hidden group max-h-[500px]">
                {selectedImage && selectedImage !== "" ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    loading="eager"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-bold px-4 py-2 rounded-full shadow-lg">
                      -{discountPercent}%
                    </div>
                  </div>
                )}
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Enhanced Thumbnail Images */}
              <div className="grid grid-cols-5 gap-3">
                {product.images?.map((image: ProductImage, index: number) => (
                  <button
                    key={index}
                    onClick={() => image.url && setSelectedImage(image.url)}
                    className={`aspect-square bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 ${selectedImage === image.url
                      ? 'border-pink-500 shadow-lg transform scale-105 ring-2 ring-pink-200'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-105'
                      }`}
                  >
                    {image.url && image.url !== "" ? (
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Product Details */}
            <div className="space-y-8">
              {/* Product Header */}
              <div>
                {product.category && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {product.category.name}
                  </div>
                )}
                
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                <p className="text-gray-600 text-lg leading-relaxed mb-6">{product.description}</p>

                {/* Price Section */}
                <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border border-pink-100">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                    {(product as any).originalPrice && (
                      <span className="text-xl text-gray-400 line-through">₹{(product as any).originalPrice}</span>
                    )}
                    {discountPercent > 0 && (
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                        Save {discountPercent}%
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {product.quantity > 0 ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">In Stock - Ready to ship</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Out of Stock</span>
                      </div>
                    )}
                    {product.quantity > 0 && product.quantity < 10 && (
                      <span className="text-sm text-amber-600 font-medium">Only {product.quantity} left!</span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-semibold text-gray-900">{product.category?.name}</p>
                      </div>
                    </div>
                    {product.brand && (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Brand</p>
                          <p className="font-semibold text-gray-900">{product.brand}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Quantity Selector */}
                <div className="mb-6">
                  <label className="font-semibold text-gray-900 block mb-3 text-lg">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <div className="w-20 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center bg-white font-semibold text-xl">
                      {quantity}
                    </div>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl"
                      disabled={quantity >= (product.quantity || 10)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex gap-4 mb-8">
                  <Button
                    variant={isInCart ? "success" : "primary"}
                    size="lg"
                    className="flex-1 py-4 text-lg"
                    onClick={handleAddToCart}
                    disabled={product.quantity <= 0 || addToCartMutation.isPending || updateCartItemMutation.isPending}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {addToCartMutation.isPending || updateCartItemMutation.isPending ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Adding...</span>
                        </>
                      ) : product.quantity <= 0 ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Out of Stock</span>
                        </>
                      ) : isInCart ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>In Cart ({cartQuantity})</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Add to Cart</span>
                        </>
                      )}
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleAddToWishlist}
                    className="w-14 h-14 rounded-xl border-2 border-gray-300 hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </Button>
                </div>

                {/* Enhanced Trust Indicators */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-pink-200 transition-colors">
                    <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Free Shipping</p>
                    <p className="text-xs text-gray-500">On orders over ₹500</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-pink-200 transition-colors">
                    <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9V2.25M4.5 9.75L12 2.25l7.5 7.5" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-500">100% protected</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-pink-200 transition-colors">
                    <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Easy Returns</p>
                    <p className="text-xs text-gray-500">30-day policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
