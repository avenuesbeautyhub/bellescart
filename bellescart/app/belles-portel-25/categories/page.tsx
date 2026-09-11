'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/hooks/user/useAdminQueries';
import { CategoryData } from '@/services/admin/categoryService';
import { globalToast } from '@/utils/globalToast';

const ADMIN_BASE = '/belles-portel-25';

export default function CategoryManagementPage() {
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState<CategoryData>({
    name: '',
    description: '',
  });

  const { data: categoriesData, isLoading } = useAdminCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = categoriesData?.data?.categories || [];

  const totalProducts = categories.reduce(
    (total, category) => total + (category.productCount || 0),
    0
  );

  const categoriesWithProducts = categories.filter(
    category => (category.productCount || 0) > 0
  ).length;

  const emptyCategories = categories.filter(
    category => (category.productCount || 0) === 0
  ).length;

  const handleAddCategory = async () => {
    const name = newCategory.name.trim();
    const description = newCategory.description?.trim() || '';

    if (!name) {
      globalToast.admin.error(
        'Validation Error',
        'Category name is required'
      );
      return;
    }

    try {
      await createCategory.mutateAsync({
        name,
        description,
      });

      globalToast.admin.success(
        'Category Created',
        `"${name}" has been created successfully`
      );

      setNewCategory({
        name: '',
        description: '',
      });

      setShowForm(false);
    } catch (error: any) {
      console.error('Failed to create category:', error);

      globalToast.admin.error(
        'Unable to Create Category',
        error?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  const handleDeleteCategory = async (
    id: string,
    name: string
  ) => {
    const confirmed = confirm(
      `Are you sure you want to delete the category "${name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteCategory.mutateAsync(id);

      globalToast.admin.success(
        'Category Deleted',
        `"${name}" has been deleted successfully`
      );
    } catch (error: any) {
      console.error('Failed to delete category:', error);

      if (
        error?.message?.includes(
          'being used by one or more products'
        )
      ) {
        globalToast.admin.error(
          'Cannot Delete Category',
          `"${name}" is being used by products. Reassign or delete those products first.`
        );
      } else {
        globalToast.admin.error(
          'Unable to Delete Category',
          error?.message || 'Something went wrong. Please try again.'
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f3] text-[#211b1e]">
      {/* =========================================================
          TOP HEADER
      ========================================================= */}
      <header className="border-b border-[#e9e2dd] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#8c7c83]">
            <button
              type="button"
              onClick={() =>
                router.push(`${ADMIN_BASE}/dashboard`)
              }
              className="transition hover:text-[#5a263f]"
            >
              Dashboard
            </button>

            <span className="text-[#cfc5c0]">/</span>

            <span className="text-[#5a263f]">
              Categories
            </span>
          </div>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#7d3657]" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d3657]">
                  Catalog Management
                </span>
              </div>

              <h1 className="font-serif text-3xl font-medium tracking-tight text-[#241b20] sm:text-4xl">
                Categories
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
                Organize your BellesCart catalog into clear,
                elegant product collections.
              </p>
            </div>

            <Button
              onClick={() => setShowForm(prev => !prev)}
              className="w-full sm:w-auto"
            >
              <span className="mr-2 text-lg leading-none">
                {showForm ? '×' : '+'}
              </span>

              {showForm
                ? 'Close Form'
                : 'Add New Category'}
            </Button>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* =======================================================
            STATISTICS
        ======================================================= */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Categories"
            value={categories.length}
            description="Catalog collections"
            icon={<GridIcon />}
          />

          <StatCard
            label="Products"
            value={totalProducts}
            description="Across all categories"
            icon={<ProductIcon />}
          />

          <StatCard
            label="Active Collections"
            value={categoriesWithProducts}
            description="Categories with products"
            icon={<CheckIcon />}
          />

          <StatCard
            label="Empty Collections"
            value={emptyCategories}
            description="Ready for products"
            icon={<FolderIcon />}
          />
        </section>

        {/* =======================================================
            ADD CATEGORY PANEL
        ======================================================= */}
        {showForm && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-[#e7ded9] bg-white shadow-[0_12px_40px_rgba(53,31,41,0.06)]">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">

              {/* Form intro */}
              <div className="relative overflow-hidden bg-[#321d28] p-6 text-white sm:p-8">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-white/10" />
                <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full border border-white/10" />

                <div className="relative">
                  <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    <PlusIcon />
                  </span>

                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#dfb8c8]">
                    New Collection
                  </p>

                  <h2 className="mt-2 font-serif text-3xl">
                    Create a category
                  </h2>

                  <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
                    Create a meaningful collection for your
                    jewelry catalog. Keep names simple and
                    descriptions useful for your team.
                  </p>

                  <div className="mt-8 space-y-3">
                    <InfoRow
                      number="01"
                      text="Choose a clear category name"
                    />

                    <InfoRow
                      number="02"
                      text="Add a short internal description"
                    />

                    <InfoRow
                      number="03"
                      text="Start adding products"
                    />
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#2a2226]">
                    Category details
                  </h3>

                  <p className="mt-1 text-sm text-[#877980]">
                    Fill in the information below to create
                    your new category.
                  </p>
                </div>

                <div className="space-y-5">
                  <Input
                    label="Category Name"
                    value={newCategory.name}
                    onChange={e =>
                      setNewCategory({
                        ...newCategory,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Antique Jhumkas"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#41373d]">
                      Description
                    </label>

                    <textarea
                      rows={5}
                      value={newCategory.description || ''}
                      onChange={e =>
                        setNewCategory({
                          ...newCategory,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe what products belong in this category..."
                      className="w-full resize-none rounded-xl border border-[#ddd4d0] bg-[#fcfaf9] px-4 py-3 text-sm text-[#292126] outline-none transition placeholder:text-[#a89ca1] focus:border-[#7d3657] focus:bg-white focus:ring-4 focus:ring-[#7d3657]/10"
                    />

                    <div className="mt-2 flex justify-between text-xs text-[#9a8d93]">
                      <span>
                        Keep the description concise and useful.
                      </span>

                      <span>
                        {(newCategory.description || '').length}/300
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-[#eee7e3] pt-5 sm:flex-row sm:justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setNewCategory({
                          name: '',
                          description: '',
                        });
                      }}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={handleAddCategory}
                      disabled={createCategory.isPending}
                      className="w-full sm:w-auto"
                    >
                      {createCategory.isPending ? (
                        <>
                          <Spinner />
                          Creating...
                        </>
                      ) : (
                        <>
                          <PlusIcon />
                          <span className="ml-2">
                            Create Category
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

        {/* =======================================================
            SECTION HEADER
        ======================================================= */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c7c83]">
              Catalog Structure
            </p>

            <h2 className="mt-1 font-serif text-2xl text-[#292126]">
              All Categories
            </h2>
          </div>

          {!isLoading && categories.length > 0 && (
            <p className="text-sm text-[#887b82]">
              {categories.length}{' '}
              {categories.length === 1
                ? 'category'
                : 'categories'}{' '}
              in your catalog
            </p>
          )}
        </div>

        {/* =======================================================
            LOADING
        ======================================================= */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CategorySkeleton key={index} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          /* =====================================================
             EMPTY STATE
          ===================================================== */
          <div className="overflow-hidden rounded-2xl border border-[#e5ddd8] bg-white">
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f6eef2] text-[#7d3657]">
                <GridIcon large />
              </div>

              <h3 className="mt-6 font-serif text-2xl text-[#2b2227]">
                No categories yet
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#877a81]">
                Your catalog does not have any collections
                yet. Create your first category to start
                organizing products.
              </p>

              <Button
                onClick={() => setShowForm(true)}
                className="mt-6"
              >
                <PlusIcon />
                <span className="ml-2">
                  Create First Category
                </span>
              </Button>
            </div>
          </div>
        ) : (
          /* =====================================================
             CATEGORY GRID
          ===================================================== */
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category, index) => {
              const productCount =
                category.productCount || 0;

              return (
                <article
                  key={category._id}
                  className="group relative overflow-hidden rounded-2xl border border-[#e6ded9] bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#d7c5cc] hover:shadow-[0_18px_50px_rgba(53,31,41,0.09)]"
                >
                  {/* Top accent */}
                  <div className="h-1 w-full bg-gradient-to-r from-[#5a263f] via-[#9b6077] to-[#d9b9c5]" />

                  <div className="p-5 sm:p-6">
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f6eef2] text-[#6e2d4c]">
                          <FolderIcon />
                        </div>

                        <div className="min-w-0">
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a08e96]">
                            Collection {String(index + 1).padStart(2, '0')}
                          </p>

                          <h3 className="truncate text-lg font-semibold text-[#2a2227]">
                            {category.name}
                          </h3>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                          productCount > 0
                            ? 'bg-[#eef6f1] text-[#3e7655]'
                            : 'bg-[#f5f2f1] text-[#8b7d83]'
                        }`}
                      >
                        {productCount > 0
                          ? 'Active'
                          : 'Empty'}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mt-5 min-h-[52px]">
                      <p className="line-clamp-2 text-sm leading-6 text-[#786c72]">
                        {category.description ||
                          'No description has been added for this category.'}
                      </p>
                    </div>

                    {/* Product count */}
                    <div className="mt-5 flex items-center justify-between rounded-xl border border-[#eee7e3] bg-[#fcfaf9] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#7d3657] shadow-sm">
                          <ProductIcon />
                        </div>

                        <div>
                          <p className="text-xs text-[#94878d]">
                            Products
                          </p>

                          <p className="text-sm font-semibold text-[#30272c]">
                            {productCount}{' '}
                            {productCount === 1
                              ? 'product'
                              : 'products'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-[#a09298]">
                          Share
                        </p>

                        <p className="text-xs font-semibold text-[#6d5c64]">
                          {totalProducts > 0
                            ? `${Math.round(
                                (productCount /
                                  totalProducts) *
                                  100
                              )}%`
                            : '0%'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          router.push(
                            `${ADMIN_BASE}/categories/edit/${category._id}`
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
                          handleDeleteCategory(
                            category._id,
                            category.name
                          )
                        }
                        disabled={deleteCategory.isPending}
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
            })}
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
   INFO ROW
============================================================= */

function InfoRow({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-[10px] font-semibold text-white/60">
        {number}
      </span>

      <span className="text-sm text-white/70">
        {text}
      </span>
    </div>
  );
}

/* =============================================================
   SKELETON
============================================================= */

function CategorySkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e7dfda] bg-white">
      <div className="h-1 animate-pulse bg-[#eee7e3]" />

      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-[#eee8e5]" />

          <div className="flex-1">
            <div className="h-2.5 w-20 animate-pulse rounded bg-[#eee8e5]" />
            <div className="mt-2 h-5 w-32 animate-pulse rounded bg-[#eee8e5]" />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-[#f0ebe8]" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-[#f0ebe8]" />
        </div>

        <div className="mt-6 h-16 animate-pulse rounded-xl bg-[#f6f2f0]" />

        <div className="mt-5 flex gap-2">
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-[#eee8e5]" />
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-[#eee8e5]" />
        </div>
      </div>
    </div>
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

function GridIcon({
  large = false,
}: {
  large?: boolean;
}) {
  return (
    <svg
      className={large ? 'h-9 w-9' : 'h-5 w-5'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m4.5 7.5 7.5 4 7.5-4M12 12v9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="m5 12 4 4L19 6"
        strokeLinecap="round"
        strokeLinejoin="round"
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