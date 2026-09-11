'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  useAdminCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from '@/hooks/user/useAdminQueries';
import { CouponData } from '@/services/admin/couponService';
import { globalToast } from '@/utils/globalToast';

type CouponStatus =
  | 'Active'
  | 'Inactive'
  | 'Expired'
  | 'Upcoming';

const DEFAULT_FORM: CouponData = {
  code: '',
  name: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
  category: '',
  minOrderValue: 0,
  maxDiscount: undefined,
  usageLimit: 0,
  usageLimitPerUser: 1,
  validFrom: new Date().toISOString().split('T')[0],
  validUntil: '',
  active: true,
};

export default function CouponManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] =
    useState<any | null>(null);

  const [formData, setFormData] =
    useState<CouponData>(DEFAULT_FORM);

  const {
    data: couponsData,
    isLoading,
  } = useAdminCoupons();

  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const coupons = couponsData?.data?.coupons || [];

  /* =========================================================
     STATS
  ========================================================= */

  const activeCoupons = coupons.filter(
    coupon => getCouponStatus(coupon).status === 'Active'
  ).length;

  const upcomingCoupons = coupons.filter(
    coupon =>
      getCouponStatus(coupon).status === 'Upcoming'
  ).length;

  const expiredCoupons = coupons.filter(
    coupon =>
      getCouponStatus(coupon).status === 'Expired'
  ).length;

  /* =========================================================
     FORM
  ========================================================= */

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'number'
          ? value === ''
            ? 0
            : parseFloat(value)
          : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      ...DEFAULT_FORM,
      validFrom: new Date()
        .toISOString()
        .split('T')[0],
    });

    setEditingCoupon(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  /* =========================================================
     CREATE
  ========================================================= */

  const handleAddCoupon = async () => {
    const code = formData.code.trim();
    const name = formData.name.trim();

    if (
      !code ||
      !name ||
      !formData.validFrom ||
      !formData.validUntil
    ) {
      globalToast.admin.error(
        'Validation Error',
        'Please fill in all required fields.'
      );
      return;
    }

    if (
      formData.discountType !== 'free_shipping' &&
      Number(formData.discountValue) <= 0
    ) {
      globalToast.admin.error(
        'Invalid Discount',
        'Discount value must be greater than 0.'
      );
      return;
    }

    if (
      formData.discountType === 'percentage' &&
      Number(formData.discountValue) > 100
    ) {
      globalToast.admin.error(
        'Invalid Percentage',
        'Percentage discount cannot exceed 100%.'
      );
      return;
    }

    if (
      formData.validUntil &&
      formData.validFrom &&
      new Date(formData.validUntil) <
        new Date(formData.validFrom)
    ) {
      globalToast.admin.error(
        'Invalid Dates',
        'Valid until date must be after the start date.'
      );
      return;
    }

    const existingCoupon = coupons.find(
      coupon =>
        coupon.code &&
        coupon.code.toUpperCase() ===
          code.toUpperCase()
    );

    if (existingCoupon) {
      globalToast.admin.error(
        'Duplicate Code',
        'A coupon with this code already exists.'
      );
      return;
    }

    try {
      const couponData = {
        code: code.toUpperCase(),
        name,
        description:
          formData.description?.trim(),
        discountType: formData.discountType,
        discountValue:
          formData.discountType === 'free_shipping'
            ? 0
            : formData.discountValue,
        category:
          formData.category?.trim(),
        minOrderValue:
          formData.minOrderValue || 0,
        maxDiscount:
          formData.maxDiscount,
        usageLimit:
          formData.usageLimit !== undefined
            ? formData.usageLimit
            : 0,
        usageLimitPerUser:
          formData.usageLimitPerUser || 1,
        validFrom: new Date(
          formData.validFrom
        ).toISOString(),
        validUntil: new Date(
          formData.validUntil
        ).toISOString(),
        active:
          formData.active !== undefined
            ? formData.active
            : true,
      };

      await createCoupon.mutateAsync(
        couponData
      );

      globalToast.admin.success(
        'Coupon Created',
        `"${code.toUpperCase()}" has been created successfully.`
      );

      resetForm();
    } catch (error: any) {
      console.error(
        'Failed to create coupon:',
        error
      );

      if (
        error?.message?.includes(
          'Coupon code already exists'
        )
      ) {
        globalToast.admin.error(
          'Duplicate Code',
          'A coupon with this code already exists.'
        );
      } else {
        globalToast.admin.error(
          'Unable to Create Coupon',
          error?.message ||
            'Something went wrong.'
        );
      }
    }
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEditCoupon = (
    coupon: any
  ) => {
    setEditingCoupon(coupon);

    setFormData({
      code: coupon.code || '',
      name: coupon.name || '',
      description:
        coupon.description || '',
      discountType:
        coupon.discountType ||
        'percentage',
      discountValue:
        coupon.discountValue || 0,
      category:
        coupon.category || '',
      minOrderValue:
        coupon.minOrderValue || 0,
      maxDiscount:
        coupon.maxDiscount,
      usageLimit:
        coupon.usageLimit !== undefined
          ? coupon.usageLimit
          : 0,
      usageLimitPerUser:
        coupon.usageLimitPerUser || 1,
      validFrom: coupon.validFrom
        ? new Date(
            coupon.validFrom
          )
            .toISOString()
            .split('T')[0]
        : new Date()
            .toISOString()
            .split('T')[0],
      validUntil: coupon.validUntil
        ? new Date(
            coupon.validUntil
          )
            .toISOString()
            .split('T')[0]
        : '',
      active:
        coupon.active !== undefined
          ? coupon.active
          : true,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* =========================================================
     UPDATE
  ========================================================= */

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return;

    const code = formData.code.trim();
    const name = formData.name.trim();

    if (
      !code ||
      !name ||
      !formData.validFrom ||
      !formData.validUntil
    ) {
      globalToast.admin.error(
        'Validation Error',
        'Please fill in all required fields.'
      );
      return;
    }

    if (
      formData.discountType !== 'free_shipping' &&
      Number(formData.discountValue) <= 0
    ) {
      globalToast.admin.error(
        'Invalid Discount',
        'Discount value must be greater than 0.'
      );
      return;
    }

    if (
      formData.discountType === 'percentage' &&
      Number(formData.discountValue) > 100
    ) {
      globalToast.admin.error(
        'Invalid Percentage',
        'Percentage discount cannot exceed 100%.'
      );
      return;
    }

    const existingCoupon = coupons.find(
      coupon =>
        coupon.code &&
        coupon.code.toUpperCase() ===
          code.toUpperCase() &&
        coupon._id !==
          editingCoupon._id
    );

    if (existingCoupon) {
      globalToast.admin.error(
        'Duplicate Code',
        'A coupon with this code already exists.'
      );
      return;
    }

    try {
      const couponData = {
        code: code.toUpperCase(),
        name,
        description:
          formData.description?.trim(),
        discountType:
          formData.discountType,
        discountValue:
          formData.discountType ===
          'free_shipping'
            ? 0
            : formData.discountValue,
        category:
          formData.category?.trim(),
        minOrderValue:
          formData.minOrderValue || 0,
        maxDiscount:
          formData.maxDiscount,
        usageLimit:
          formData.usageLimit !== undefined
            ? formData.usageLimit
            : 0,
        usageLimitPerUser:
          formData.usageLimitPerUser || 1,
        validFrom: new Date(
          formData.validFrom
        ).toISOString(),
        validUntil: new Date(
          formData.validUntil
        ).toISOString(),
        active:
          formData.active !== undefined
            ? formData.active
            : true,
      };

      await updateCoupon.mutateAsync({
        id: editingCoupon._id,
        couponData,
      });

      globalToast.admin.success(
        'Coupon Updated',
        `"${code.toUpperCase()}" has been updated successfully.`
      );

      resetForm();
    } catch (error: any) {
      console.error(
        'Failed to update coupon:',
        error
      );

      if (
        error?.message?.includes(
          'Coupon code already exists'
        )
      ) {
        globalToast.admin.error(
          'Duplicate Code',
          'A coupon with this code already exists.'
        );
      } else {
        globalToast.admin.error(
          'Unable to Update Coupon',
          error?.message ||
            'Something went wrong.'
        );
      }
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDeleteCoupon = async (
    id: string,
    code: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete the coupon "${code}"?`
      )
    ) {
      return;
    }

    try {
      await deleteCoupon.mutateAsync(id);

      globalToast.admin.success(
        'Coupon Deleted',
        `Coupon "${code}" has been deleted.`
      );
    } catch (error: any) {
      console.error(
        'Failed to delete coupon:',
        error
      );

      globalToast.admin.error(
        'Unable to Delete Coupon',
        error?.message ||
          'Something went wrong.'
      );
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f8f6f3] text-[#211b1e]">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-[#e9e2dd] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">

          <div className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#93858c]">
            <span>
              Dashboard
            </span>

            <span className="text-[#d2c8c4]">
              /
            </span>

            <span className="text-[#6e2d4c]">
              Coupons
            </span>
          </div>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#7d3657]" />

                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d3657]">
                  Marketing & Promotions
                </span>
              </div>

              <h1 className="font-serif text-3xl font-medium tracking-tight text-[#241b20] sm:text-4xl">
                Coupons
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
                Create and manage promotional offers,
                discount campaigns, and customer incentives.
              </p>
            </div>

            <Button
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  openCreateForm();
                }
              }}
              className="w-full sm:w-auto"
            >
              <span className="mr-2 text-lg leading-none">
                {showForm ? '×' : '+'}
              </span>

              {showForm
                ? 'Close Form'
                : 'Create Coupon'}
            </Button>
          </div>
        </div>
      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* ====================================================
            STATS
        ==================================================== */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total Coupons"
            value={coupons.length}
            description="All promotional codes"
            icon={<TicketIcon />}
          />

          <StatCard
            label="Active"
            value={activeCoupons}
            description="Currently available"
            icon={<CheckCircleIcon />}
          />

          <StatCard
            label="Upcoming"
            value={upcomingCoupons}
            description="Scheduled campaigns"
            icon={<CalendarIcon />}
          />

          <StatCard
            label="Expired"
            value={expiredCoupons}
            description="Past campaigns"
            icon={<ClockIcon />}
          />
        </section>

        {/* ====================================================
            CREATE / EDIT FORM
        ==================================================== */}

        {showForm && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-[#e6ded9] bg-white shadow-[0_15px_45px_rgba(53,31,41,0.06)]">

            <div className="grid lg:grid-cols-[0.7fr_1.3fr]">

              {/* Intro */}
              <div className="relative overflow-hidden bg-[#321d28] p-6 text-white sm:p-8">

                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full border border-white/10" />

                <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full border border-white/10" />

                <div className="relative">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <TicketIcon />
                  </div>

                  <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#dfb8c8]">
                    {editingCoupon
                      ? 'Campaign Editor'
                      : 'New Promotion'}
                  </p>

                  <h2 className="mt-2 font-serif text-3xl">
                    {editingCoupon
                      ? 'Edit coupon'
                      : 'Create a coupon'}
                  </h2>

                  <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
                    {editingCoupon
                      ? 'Update the campaign details, discount rules, usage limits, or visibility.'
                      : 'Build a promotional offer with clear discount rules and campaign dates.'}
                  </p>

                  {/* Coupon preview */}
                  <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">

                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">
                      Preview
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-mono text-lg font-bold tracking-wider text-white">
                          {formData.code
                            .trim()
                            .toUpperCase() ||
                            'YOURCODE'}
                        </p>

                        <p className="mt-1 text-xs text-white/45">
                          {formData.name ||
                            'Your coupon name'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-semibold text-[#e5bfce]">
                          {getDiscountLabel(
                            formData
                          )}
                        </p>

                        <p className="text-[9px] uppercase tracking-wider text-white/40">
                          Discount
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <InfoItem text="Set your discount value" />
                    <InfoItem text="Define minimum order requirements" />
                    <InfoItem text="Control campaign dates and usage" />
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-5 sm:p-8">

                <div className="mb-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#998a91]">
                    Campaign Details
                  </p>

                  <h3 className="mt-1 text-xl font-semibold text-[#2a2227]">
                    {editingCoupon
                      ? 'Update promotion'
                      : 'Promotion settings'}
                  </h3>
                </div>

                <div className="space-y-7">

                  {/* Basic information */}
                  <div>
                    <SectionLabel>
                      Basic Information
                    </SectionLabel>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                      <Input
                        label="Coupon Code"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="e.g. BELLES20"
                        required
                      />

                      <Input
                        label="Coupon Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. 20% Off Sale"
                        required
                      />

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-[#41373d]">
                          Description
                        </label>

                        <textarea
                          name="description"
                          rows={3}
                          maxLength={300}
                          value={
                            formData.description
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="Describe this promotion..."
                          className="w-full resize-none rounded-xl border border-[#ddd4d0] bg-[#fcfaf9] px-4 py-3 text-sm leading-6 text-[#292126] outline-none transition placeholder:text-[#aaa0a5] focus:border-[#7d3657] focus:bg-white focus:ring-4 focus:ring-[#7d3657]/10"
                        />

                        <div className="mt-1 text-right text-[11px] text-[#a09298]">
                          {
                            formData.description
                              ?.length
                          }
                          /300
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Discount */}
                  <div>
                    <SectionLabel>
                      Discount Rules
                    </SectionLabel>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                      <SelectField
                        label="Discount Type"
                        name="discountType"
                        value={
                          formData.discountType
                        }
                        onChange={
                          handleInputChange
                        }
                      >
                        <option value="percentage">
                          Percentage Discount
                        </option>

                        <option value="fixed">
                          Fixed Amount
                        </option>

                        <option value="free_shipping">
                          Free Shipping
                        </option>
                      </SelectField>

                      {formData.discountType !==
                        'free_shipping' && (
                        <Input
                          label={
                            formData.discountType ===
                            'percentage'
                              ? 'Discount Percentage'
                              : 'Discount Amount (₹)'
                          }
                          name="discountValue"
                          type="number"
                          min="0"
                          max={
                            formData.discountType ===
                            'percentage'
                              ? '100'
                              : undefined
                          }
                          value={
                            formData.discountValue
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder={
                            formData.discountType ===
                            'percentage'
                              ? '20'
                              : '100'
                          }
                          required
                        />
                      )}

                      {formData.discountType ===
                        'percentage' && (
                        <Input
                          label="Maximum Discount (₹)"
                          name="maxDiscount"
                          type="number"
                          min="0"
                          value={
                            formData.maxDiscount ||
                            ''
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="e.g. 500"
                        />
                      )}

                      <Input
                        label="Minimum Order Value (₹)"
                        name="minOrderValue"
                        type="number"
                        min="0"
                        value={
                          formData.minOrderValue
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="e.g. 1000"
                      />

                      <Input
                        label="Category"
                        name="category"
                        value={
                          formData.category
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="Optional — e.g. Jhumkas"
                      />
                    </div>
                  </div>

                  {/* Usage */}
                  <div>
                    <SectionLabel>
                      Usage Limits
                    </SectionLabel>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                      <Input
                        label="Total Usage Limit"
                        name="usageLimit"
                        type="number"
                        min="0"
                        value={
                          formData.usageLimit
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="0 = Unlimited"
                      />

                      <Input
                        label="Limit Per User"
                        name="usageLimitPerUser"
                        type="number"
                        min="1"
                        value={
                          formData.usageLimitPerUser
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="e.g. 1"
                      />
                    </div>

                    <p className="mt-2 text-xs text-[#9b8d94]">
                      Set total usage to 0 when you want
                      unlimited redemptions.
                    </p>
                  </div>

                  {/* Dates */}
                  <div>
                    <SectionLabel>
                      Campaign Period
                    </SectionLabel>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                      <Input
                        label="Valid From"
                        name="validFrom"
                        type="date"
                        value={
                          formData.validFrom
                        }
                        onChange={
                          handleInputChange
                        }
                        required
                      />

                      <Input
                        label="Valid Until"
                        name="validUntil"
                        type="date"
                        value={
                          formData.validUntil
                        }
                        onChange={
                          handleInputChange
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div className="rounded-xl border border-[#e9e1dd] bg-[#fcfaf9] p-4">
                    <label className="flex cursor-pointer items-center justify-between gap-4">

                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            formData.active
                              ? 'bg-[#edf6f0] text-[#3e7655]'
                              : 'bg-[#f1eded] text-[#887b81]'
                          }`}
                        >
                          {formData.active ? (
                            <CheckCircleIcon />
                          ) : (
                            <PauseIcon />
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#30272c]">
                            Coupon Status
                          </p>

                          <p className="mt-0.5 text-xs text-[#8c7e85]">
                            {formData.active
                              ? 'Customers can use this coupon when valid.'
                              : 'This coupon is disabled.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="active"
                          checked={
                            formData.active
                          }
                          onChange={e =>
                            setFormData(
                              prev => ({
                                ...prev,
                                active:
                                  e.target
                                    .checked,
                              })
                            )
                          }
                          className="peer sr-only"
                        />

                        <div className="relative h-7 w-12 rounded-full bg-[#d8d0cd] transition peer-checked:bg-[#6e2d4c]">
                          <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col-reverse gap-3 border-t border-[#eee7e3] pt-6 sm:flex-row sm:justify-end">

                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      onClick={
                        editingCoupon
                          ? handleUpdateCoupon
                          : handleAddCoupon
                      }
                      disabled={
                        createCoupon.isPending ||
                        updateCoupon.isPending
                      }
                      className="w-full sm:w-auto"
                    >
                      {createCoupon.isPending ||
                      updateCoupon.isPending ? (
                        <>
                          <Spinner />

                          <span className="ml-2">
                            {editingCoupon
                              ? 'Updating...'
                              : 'Creating...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <SaveIcon />

                          <span className="ml-2">
                            {editingCoupon
                              ? 'Save Changes'
                              : 'Create Coupon'}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================
            SECTION HEADER
        ==================================================== */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#998a91]">
              Promotion Library
            </p>

            <h2 className="mt-1 font-serif text-2xl text-[#292126]">
              All Coupons
            </h2>
          </div>

          {!isLoading &&
            coupons.length > 0 && (
              <p className="text-sm text-[#887b82]">
                {coupons.length}{' '}
                {coupons.length === 1
                  ? 'promotion'
                  : 'promotions'}
              </p>
            )}
        </div>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <CouponSkeleton
                key={index}
              />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          /* ==================================================
             EMPTY
          ================================================== */

          <div className="rounded-2xl border border-[#e5ddd8] bg-white">
            <div className="flex min-h-[430px] flex-col items-center justify-center px-6 py-16 text-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f6eef2] text-[#7d3657]">
                <TicketIcon large />
              </div>

              <h3 className="mt-6 font-serif text-2xl text-[#2b2227]">
                No coupons yet
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#877a81]">
                Create your first promotion to offer
                customers a discount or free shipping.
              </p>

              <Button
                onClick={openCreateForm}
                className="mt-6"
              >
                <PlusIcon />

                <span className="ml-2">
                  Create First Coupon
                </span>
              </Button>
            </div>
          </div>
        ) : (
          /* ==================================================
             COUPON CARDS
          ================================================== */

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            {coupons.map(
              (coupon: any) => {
                const status =
                  getCouponStatus(
                    coupon
                  );

                const usageLimit =
                  coupon.usageLimit;

                const usedCount =
                  coupon.usedCount || 0;

                const usagePercentage =
                  usageLimit &&
                  usageLimit > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (usedCount /
                            usageLimit) *
                            100
                        )
                      )
                    : 0;

                return (
                  <article
                    key={
                      coupon._id ||
                      coupon.id
                    }
                    className="group overflow-hidden rounded-2xl border border-[#e6ded9] bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#d8c7ce] hover:shadow-[0_18px_50px_rgba(53,31,41,0.09)]"
                  >

                    {/* Ticket top */}
                    <div className="relative border-b border-dashed border-[#ded4d0] bg-[#fcfaf9] p-5">

                      <div className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-[#f8f6f3]" />

                      <div className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-[#f8f6f3]" />

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f5eaf0] text-[#6e2d4c]">
                            <TicketIcon />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-mono text-lg font-bold tracking-wider text-[#2d252a]">
                              {coupon.code ||
                                'N/A'}
                            </p>

                            <p className="truncate text-xs text-[#8b7d84]">
                              {coupon.name ||
                                'Untitled Coupon'}
                            </p>
                          </div>
                        </div>

                        <StatusPill
                          status={
                            status.status
                          }
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">

                      <div className="flex items-end justify-between gap-4">

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a09298]">
                            Offer
                          </p>

                          <p className="mt-1 text-2xl font-semibold text-[#6e2d4c]">
                            {getDiscountLabel(
                              coupon
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-[#a09298]">
                            Category
                          </p>

                          <p className="mt-1 max-w-[120px] truncate text-xs font-medium text-[#5e5158]">
                            {coupon.category ||
                              'All Products'}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mt-4 min-h-[40px] line-clamp-2 text-xs leading-5 text-[#81747b]">
                        {coupon.description ||
                          'No description provided for this promotion.'}
                      </p>

                      {/* Rules */}
                      <div className="mt-5 grid grid-cols-2 gap-2">

                        <RuleItem
                          label="Min. order"
                          value={
                            coupon.minOrderValue
                              ? formatCurrency(
                                  coupon.minOrderValue
                                )
                              : 'None'
                          }
                        />

                        <RuleItem
                          label="Per user"
                          value={
                            coupon.usageLimitPerUser ||
                            1
                          }
                        />

                        <RuleItem
                          label="Starts"
                          value={
                            formatDate(
                              coupon.validFrom
                            )
                          }
                        />

                        <RuleItem
                          label="Expires"
                          value={
                            formatDate(
                              coupon.validUntil
                            )
                          }
                        />
                      </div>

                      {/* Usage */}
                      <div className="mt-4 rounded-xl border border-[#eee7e3] bg-[#fcfaf9] p-3">

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#988a91]">
                            Usage
                          </span>

                          <span className="text-xs font-semibold text-[#51444b]">
                            {usageLimit &&
                            usageLimit > 0
                              ? `${usedCount}/${usageLimit}`
                              : 'Unlimited'}
                          </span>
                        </div>

                        {usageLimit &&
                          usageLimit > 0 && (
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e9e1dd]">
                              <div
                                className="h-full rounded-full bg-[#7d3657] transition-all"
                                style={{
                                  width: `${usagePercentage}%`,
                                }}
                              />
                            </div>
                          )}
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex gap-2">

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            handleEditCoupon(
                              coupon
                            )
                          }
                        >
                          <EditIcon />

                          <span className="ml-2">
                            Edit
                          </span>
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          className="flex-1"
                          onClick={() =>
                            handleDeleteCoupon(
                              coupon._id ||
                                coupon.id,
                              coupon.code
                            )
                          }
                          disabled={
                            deleteCoupon.isPending
                          }
                        >
                          <TrashIcon />

                          <span className="ml-2">
                            Delete
                          </span>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-[#e7dfda] bg-white p-5 transition hover:border-[#d8c8ce] hover:shadow-[0_12px_35px_rgba(53,31,41,0.06)]">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#96888f]">
            {label}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#2a2227]">
            {value}
          </p>

          <p className="mt-1 text-xs text-[#9a8d93]">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7eff3] text-[#70304e] transition group-hover:scale-105">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   SECTION LABEL
============================================================= */

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="h-px flex-1 bg-[#eee7e3]" />

      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#988a91]">
        {children}
      </span>

      <span className="h-px flex-1 bg-[#eee7e3]" />
    </div>
  );
}

/* =============================================================
   SELECT
============================================================= */

function SelectField({
  label,
  name,
  value,
  onChange,
  children,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#41373d]">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-[46px] w-full rounded-xl border border-[#ddd4d0] bg-[#fcfaf9] px-4 text-sm text-[#292126] outline-none transition focus:border-[#7d3657] focus:bg-white focus:ring-4 focus:ring-[#7d3657]/10"
      >
        {children}
      </select>
    </div>
  );
}

/* =============================================================
   RULE ITEM
============================================================= */

function RuleItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-[#eee7e3] bg-[#fcfaf9] px-3 py-2.5">
      <p className="text-[9px] uppercase tracking-wider text-[#a09399]">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-[#51444b]">
        {value}
      </p>
    </div>
  );
}

/* =============================================================
   STATUS
============================================================= */

function StatusPill({
  status,
}: {
  status: CouponStatus;
}) {
  const styles: Record<
    CouponStatus,
    string
  > = {
    Active:
      'bg-[#edf6f0] text-[#3e7655]',
    Inactive:
      'bg-[#f1eded] text-[#82757b]',
    Expired:
      'bg-[#f9eeee] text-[#a24f4f]',
    Upcoming:
      'bg-[#fff6e5] text-[#9b722e]',
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* =============================================================
   INFO ITEM
============================================================= */

function InfoItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15">
        <CheckIcon />
      </span>

      <span className="text-xs text-white/60">
        {text}
      </span>
    </div>
  );
}

/* =============================================================
   SKELETON
============================================================= */

function CouponSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e7dfda] bg-white">

      <div className="h-24 animate-pulse bg-[#f0ebe8]" />

      <div className="p-5">

        <div className="flex justify-between">
          <div>
            <div className="h-3 w-16 animate-pulse rounded bg-[#eee8e5]" />
            <div className="mt-2 h-7 w-24 animate-pulse rounded bg-[#eee8e5]" />
          </div>

          <div className="h-5 w-16 animate-pulse rounded-full bg-[#eee8e5]" />
        </div>

        <div className="mt-5 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-[#f0ebe8]" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-[#f0ebe8]" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(
            item => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-lg bg-[#f5f1ef]"
              />
            )
          )}
        </div>

        <div className="mt-5 h-9 animate-pulse rounded-xl bg-[#eee8e5]" />
      </div>
    </div>
  );
}

/* =============================================================
   HELPERS
============================================================= */

function getCouponStatus(
  coupon: any
): {
  status: CouponStatus;
} {
  if (coupon.active === false) {
    return {
      status: 'Inactive',
    };
  }

  if (isCouponExpired(coupon.validUntil)) {
    return {
      status: 'Expired',
    };
  }

  if (isCouponUpcoming(coupon.validFrom)) {
    return {
      status: 'Upcoming',
    };
  }

  return {
    status: 'Active',
  };
}

function isCouponExpired(
  validUntil: string
) {
  if (!validUntil) return false;

  const expiryDate =
    new Date(validUntil);

  return (
    !isNaN(expiryDate.getTime()) &&
    expiryDate < new Date()
  );
}

function isCouponUpcoming(
  validFrom: string
) {
  if (!validFrom) return false;

  const startDate =
    new Date(validFrom);

  return (
    !isNaN(startDate.getTime()) &&
    startDate > new Date()
  );
}

function getDiscountLabel(
  coupon: any
) {
  if (
    coupon.discountType ===
    'free_shipping'
  ) {
    return 'FREE';
  }

  if (
    coupon.discountType ===
    'percentage'
  ) {
    return `${coupon.discountValue || 0}%`;
  }

  return formatCurrency(
    coupon.discountValue || 0
  );
}

function formatCurrency(
  value: number
) {
  return `₹${Number(value || 0).toLocaleString(
    'en-IN'
  )}`;
}

function formatDate(
  value: string
) {
  if (!value) return 'Not set';

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return 'Not set';
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );
}

/* =============================================================
   SPINNER
============================================================= */

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

/* =============================================================
   ICONS
============================================================= */

function TicketIcon({
  large = false,
}: {
  large?: boolean;
}) {
  return (
    <svg
      className={
        large
          ? 'h-9 w-9'
          : 'h-5 w-5'
      }
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5V8a2 2 0 0 0 0 4v2.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 14.5V12a2 2 0 0 0 0-4V5.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M9 3v3M9 18v3M15 3v3M15 18v3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M12 5v14M5 12h14"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M5 4h11l3 3v13H5V4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 4v6h8V4M8 20v-6h8v6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M12 20h9"
        strokeLinecap="round"
      />

      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-3 w-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path
        d="m5 12 4 4L19 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="12" cy="12" r="9" />

      <path
        d="m8 12 2.5 2.5L16.5 9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path
        d="M16 3v4M8 3v4M3 10h18"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="12" cy="12" r="9" />

      <path
        d="M12 7v5l3 2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="12" cy="12" r="9" />

      <path
        d="M10 9v6M14 9v6"
        strokeLinecap="round"
      />
    </svg>
  );
}