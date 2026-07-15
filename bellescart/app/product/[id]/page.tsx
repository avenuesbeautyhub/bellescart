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
import { productService } from '@/services/productService';
import { cartService } from '@/services/cartService';
import { globalToast } from '@/utils/globalToast';
import { useCart } from '@/contexts/CartContext';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;
  const { user, loaded, isAuthenticated } = useRequireUserAuth();
  const { refreshCartCount } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [cartQuantity, setCartQuantity] = useState(0);

  // Load product for authenticated users only
  useEffect(() => {
    if (productId && loaded && isAuthenticated) {
      loadProduct();
      loadCart();
    }
  }, [productId, loaded, isAuthenticated]);

  // Check if product is in cart
  useEffect(() => {
    if (product) {
      console.log('Checking cart for product:', product._id);
      console.log('Cart items:', cartItems);
      const cartItem = cartItems.find(item => item.product?._id === product._id);
      console.log('Found cart item:', cartItem);
      if (cartItem) {
        setIsInCart(true);
        setCartItemId(cartItem._id);
        setCartQuantity(cartItem.quantity);
        setQuantity(cartItem.quantity);
      } else {
        setIsInCart(false);
        setCartItemId(null);
        setCartQuantity(0);
        setQuantity(1);
      }
    }
  }, [product, cartItems]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(productId!);
      if (response.success && response.data) {
        const productData = response.data.product || response.data.products?.[0];
        if (productData) {
          setProduct(productData);
          // Set main image as selected
          const mainImage = productData.images?.find((img: ProductImage) => img.isMain)?.url || productData.images?.[0]?.url || '';
          setSelectedImage(mainImage);
        }
      }
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      setCartLoading(true);
      const response = await cartService.getCart();
      if (response.success && response.data?.items) {
        setCartItems(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

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
        let response;
        if (isInCart && cartItemId) {
          // Update existing cart item
          response = await cartService.updateCartItem(cartItemId, {
            quantity: quantity
          });
          if (response.success) {
            globalToast.cart.quantityUpdated();
          } else {
            globalToast.cart.updateFailed();
          }
        } else {
          // Add new item to cart
          response = await cartService.addToCart({
            productId: product._id,
            quantity: quantity
          });
          if (response.success) {
            globalToast.cart.addSuccess();
          } else {
            globalToast.cart.addFailed();
          }
        }
        
        if (response.success) {
          refreshCartCount(); // Update cart count in navbar
          await loadCart(); // Reload cart to update state
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
  if (!loaded || loading) {
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

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/products" className="text-gray-500 hover:text-gray-700 transition-colors">Products</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Product Images */}
            <div className="space-y-4">
              <div className="aspect-[4/5] bg-white rounded-2xl shadow-lg overflow-hidden group max-h-[400px]">
                <img
                  src={selectedImage}
                  alt={product.name}
                  loading="eager"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {discountPercent > 0 && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="danger" className="text-lg font-bold px-3 py-2 shadow-lg">
                      -{discountPercent}%
                    </Badge>
                  </div>
                )}
                {!product.quantity && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white text-3xl font-bold mb-2">Out of Stock</div>
                      <p className="text-white text-sm">This item is currently unavailable</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Thumbnail Images */}
              <div className="grid grid-cols-5 gap-3">
                {product.images?.map((image: ProductImage, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image.url)}
                    className={`aspect-square bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 ${selectedImage === image.url
                      ? 'border-pink-500 shadow-lg transform scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Product Details */}
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                      {product.name}
                    </h1>

                  </div>
                </div>

                <p className="text-gray-600 text-base leading-relaxed mb-6">{product.description}</p>

                {/* Price Section */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl font-bold text-gray-900">Rs{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">Rs{product.originalPrice}</span>
                    )}
                    {discountPercent > 0 && (
                      <Badge variant="danger" className="text-base font-bold px-3 py-1">
                        Save {discountPercent}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {product.quantity > 0 ? (
                      <span className="text-green-600 font-medium">In Stock - Ready to ship</span>
                    ) : (
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-pink-600 font-bold">C</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-semibold text-gray-900">{product.category?.name}</p>
                      </div>
                    </div>
                    {product.brand && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold">B</span>
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
                <div className="mb-6 text-pink-900">
                  <label className="font-semibold text-gray-900 block mb-3">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity <= 1}
                    >
                      <span className="text-lg font-bold">-</span>
                    </button>
                    <div className="w-16 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center bg-white">
                      <span className="text-lg font-semibold">{quantity}</span>
                    </div>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity >= (product.quantity || 10)}
                    >
                      <span className="text-lg font-bold">+</span>
                    </button>
                  </div>
                  {product.quantity && product.quantity < 10 && (
                    <p className="text-sm text-gray-500 mt-2">Only {product.quantity} items left in stock!</p>
                  )}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex gap-3 mb-6">
                  <Button
                    variant={isInCart ? "secondary" : "primary"}
                    size="lg"
                    className={`flex-1 ${isInCart 
                      ? 'bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200' 
                      : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={handleAddToCart}
                    disabled={product.quantity <= 0}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isInCart ? (
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
                    className="w-12 h-12 rounded-xl border-2 border-gray-300 hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-xl mb-1">truck</div>
                    <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                    <p className="text-xs text-gray-500">On orders over Rs500</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-xl mb-1">shield</div>
                    <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-500">100% protected</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-xl mb-1">refresh</div>
                    <p className="text-sm font-medium text-gray-900">Easy Returns</p>
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
