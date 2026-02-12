'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import CartCountdown from '@/components/CartCountdown';
import AdvancedCouponSystem from '@/components/AdvancedCouponSystem';
import { useCart } from '@/context/CartContext';
import PageHero from '@/components/PageHero';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function CartPage() {
  usePageTitle('Shopping Cart');
  const { cart: cartItems, removeFromCart, updateQuantity, subtotal, addToCart } = useCart();
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  // Function to move item to saved for later (local state only for now)
  const saveForLater = (id: string) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      setSavedItems([...savedItems, item]);
      removeFromCart(item.id, item.variant); // Use context's removeFromCart
    }
  };

  const moveToCart = (id: string) => {
    const item = savedItems.find(item => item.id === id);
    if (item) {
      // addToCart expects a CartItem object which already includes quantity
      addToCart(item);
      setSavedItems(savedItems.filter(item => item.id !== id));
    }
  };

  const applyCoupon = (coupon: any) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Savings calculation is tricky without originalPrice in Context.
  // Assuming 0 for now unless we update Context.
  const savings = 0;

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      couponDiscount = subtotal * (appliedCoupon.discount / 100);
    } else {
      couponDiscount = appliedCoupon.discount;
    }
  }

  const shipping = subtotal >= 200 ? 0 : 15;
  const total = subtotal - couponDiscount + shipping;

  return (
    <div className="min-h-screen bg-gray-100">
      <PageHero title="Shopping Cart" />
      <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CartCountdown />

        {cartItems.length === 0 && savedItems.length === 0 ? (
          <section className="py-12 sm:py-20">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                <i className="ri-shopping-cart-line text-4xl sm:text-5xl text-emerald-600" />
              </div>
              <p className="text-xs font-semibold tracking-[0.25em] text-emerald-600 uppercase mb-2">Your cart</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 text-sm sm:text-base">
                You haven&apos;t added anything yet. Find your next pair in the shop.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center rounded-full bg-emerald-600 text-white px-8 py-3.5 text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Continue shopping
                <i className="ri-arrow-right-line ml-2" />
              </Link>
            </div>
          </section>
        ) : (
          <section className="py-6 sm:py-10">
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl bg-white shadow-sm border border-gray-200/80 p-4 sm:p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Cart items ({cartItems.length})
                    </h2>
                    {savings > 0 && (
                      <span className="text-sm font-semibold text-emerald-700">
                        You save GH₵{savings.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={`${item.id}-${item.variant || ''}`}
                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-200/80"
                      >
                        <Link
                          href={`/product/${item.slug || item.id}`}
                          className="relative w-full sm:w-28 h-40 sm:h-28 flex-shrink-0 rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover object-top"
                            sizes="(max-width: 640px) 100vw, 112px"
                            quality={70}
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2 mb-1">
                            <Link
                              href={`/product/${item.slug || item.id}`}
                              className="font-semibold text-gray-900 hover:text-emerald-700 transition-colors line-clamp-2 text-sm sm:text-base"
                            >
                              {item.name}
                            </Link>
                            <button
                              onClick={() => removeFromCart(item.id, item.variant)}
                              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              aria-label="Remove item"
                            >
                              <i className="ri-close-line text-xl" />
                            </button>
                          </div>
                          {item.variant && (
                            <p className="text-xs text-gray-500 mb-2">Variant: {item.variant}</p>
                          )}
                          <p className="text-xs text-emerald-600 font-medium mb-3">In stock</p>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-base sm:text-lg font-bold text-gray-900">
                              GH₵{item.price.toFixed(2)}
                            </span>
                            <div className="flex items-center border border-gray-200 rounded-xl bg-white">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-l-xl transition-colors"
                                title={item.quantity <= (item.moq || 1) ? 'Remove item' : 'Decrease'}
                              >
                                {item.quantity <= (item.moq || 1) ? (
                                  <i className="ri-delete-bin-line text-red-500 text-sm" />
                                ) : (
                                  <i className="ri-subtract-line" />
                                )}
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(
                                    item.id,
                                    parseInt(e.target.value) || (item.moq || 1),
                                    item.variant
                                  )
                                }
                                className="w-11 h-9 text-center border-x border-gray-200 text-sm font-semibold focus:outline-none"
                                min={item.moq || 1}
                                max={item.maxStock}
                              />
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-r-xl transition-colors"
                              >
                                <i className="ri-add-line" />
                              </button>
                            </div>
                          </div>
                          {(item.moq || 1) > 1 && (
                            <p className="text-xs text-amber-600 mt-2">Min. order: {item.moq} units</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {savedItems.length > 0 && (
                  <div className="rounded-2xl bg-white shadow-sm border border-gray-200/80 p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Saved for later ({savedItems.length})
                    </h3>
                    <div className="space-y-4">
                      {savedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 pb-4 border-b border-emerald-100 last:border-0 last:pb-0"
                        >
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl bg-white border border-emerald-50 overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover object-top"
                              sizes="80px"
                              quality={60}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                            <p className="text-sm font-bold text-gray-900">GH₵{item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="rounded-2xl bg-white shadow-sm border border-gray-200/80 border-l-4 border-l-emerald-500 p-4 sm:p-6 sticky top-24">
                  <p className="text-xs font-semibold tracking-[0.2em] text-emerald-600 uppercase mb-2">
                    Summary
                  </p>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Order summary</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-semibold">GH₵{subtotal.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-emerald-700">
                        <span>Coupon ({appliedCoupon.code})</span>
                        <span className="font-semibold">-GH₵{couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Shipping</span>
                      <span className="font-semibold">
                        {shipping === 0 ? 'FREE' : `GH₵${shipping.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 pt-4 pb-4 px-4 -mx-4 mb-4">
                    <div className="flex justify-between text-base font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-emerald-700">GH₵{total.toFixed(2)}</span>
                    </div>
                  </div>
                  <AdvancedCouponSystem
                    subtotal={subtotal}
                    onApply={applyCoupon}
                    onRemove={removeCoupon}
                    appliedCoupon={appliedCoupon}
                  />
                  <Link
                    href="/checkout"
                    className="mt-4 block w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 font-semibold text-center text-sm transition-colors"
                  >
                    Proceed to checkout
                  </Link>
                  <Link
                    href="/shop"
                    className="mt-3 block w-full text-center text-emerald-700 hover:text-emerald-800 font-semibold text-sm py-2"
                  >
                    Continue shopping
                  </Link>
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <i className="ri-shield-check-line text-emerald-600" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <i className="ri-arrow-left-right-line text-emerald-600" />
                      <span>30-day returns</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <i className="ri-customer-service-line text-emerald-600" />
                      <span>Support when you need it</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
