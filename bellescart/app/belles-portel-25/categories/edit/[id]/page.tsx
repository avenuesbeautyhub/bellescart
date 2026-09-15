'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { adminCategoryService } from '@/services/admin/categoryService';
import { globalToast } from '@/utils/globalToast';

interface EditCategoryData {
  name: string;
  description: string;
  isActive: boolean;
}

const ADMIN_BASE = '/belles-portel-25';

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  const [formData, setFormData] = useState<EditCategoryData>({
    name: '',
    description: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    loadCategory();
  }, [id]);

  const loadCategory = async () => {
    try {
      const response =
        await adminCategoryService.getCategoryById(id);

      if (response.success && response.data?.category) {
        const category = response.data.category;

        setFormData({
          name: category.name || '',
          description: category.description || '',
          isActive: category.isActive !== false,
        });
      } else {
        globalToast.admin.error(
          'Category Not Found',
          'The requested category could not be found.'
        );

        router.push(`${ADMIN_BASE}/categories`);
      }
    } catch (error: any) {
      console.error('Failed to load category:', error);

      globalToast.admin.error(
        'Load Failed',
        'Failed to load category details'
      );

      router.push(`${ADMIN_BASE}/categories`);
    } finally {
      setPageLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;

      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      globalToast.admin.error(
        'Validation Error',
        'Category name is required'
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await adminCategoryService.updateCategory(id, {
          ...formData,
          name: trimmedName,
          description: formData.description.trim(),
        });

      if (response.success) {
        globalToast.admin.success(
          'Category Updated',
          `"${trimmedName}" has been updated successfully`
        );

        router.push(`${ADMIN_BASE}/categories`);
      } else {
        globalToast.admin.error(
          'Update Failed',
          response.message ||
            'Failed to update category'
        );
      }
    } catch (error: any) {
      console.error(
        'Failed to update category:',
        error
      );

      globalToast.admin.error(
        'Network Error',
        error?.message ||
          'Network error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#f8f6f3]">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#d9cdd1] border-t-[#6e2d4c]" />
            </div>

            <h2 className="mt-5 font-serif text-2xl text-[#2b2227]">
              Loading category
            </h2>

            <p className="mt-2 text-sm text-[#8b7e84]">
              Fetching the latest category details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3] text-[#211b1e]">

      {/* ========================================================
          HEADER
      ======================================================== */}
      <header className="border-b border-[#e9e2dd] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#93858c]">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `${ADMIN_BASE}/dashboard`
                )
              }
              className="transition hover:text-[#6e2d4c]"
            >
              Dashboard
            </button>

            <span className="text-[#d2c8c4]">
              /
            </span>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `${ADMIN_BASE}/categories`
                )
              }
              className="transition hover:text-[#6e2d4c]"
            >
              Categories
            </button>

            <span className="text-[#d2c8c4]">
              /
            </span>

            <span className="text-[#6e2d4c]">
              Edit
            </span>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#7d3657]" />

                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d3657]">
                  Catalog Management
                </span>
              </div>

              <h1 className="font-serif text-3xl font-medium tracking-tight text-[#241b20] sm:text-4xl">
                Edit Category
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
                Update the collection details and visibility
                of this category.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  `${ADMIN_BASE}/categories`
                )
              }
              className="w-full sm:w-auto"
            >
              <ArrowLeftIcon />
              <span className="ml-2">
                Back to Categories
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* ========================================================
          MAIN
      ======================================================== */}
      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

          {/* ======================================================
              FORM
          ====================================================== */}
          <section className="overflow-hidden rounded-2xl border border-[#e6ded9] bg-white shadow-[0_12px_40px_rgba(53,31,41,0.05)]">

            {/* Form heading */}
            <div className="border-b border-[#eee7e3] px-5 py-5 sm:px-7">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7eef2] text-[#6e2d4c]">
                  <FolderIcon />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#2a2227]">
                    Category Details
                  </h2>

                  <p className="mt-0.5 text-sm text-[#8b7d84]">
                    Manage the information shown for this
                    collection.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-7"
            >
              <div className="space-y-6">

                {/* Category Name */}
                <div>
                  <Input
                    label="Category Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Antique Jhumkas"
                    required
                  />

                  <p className="mt-2 text-xs text-[#9a8d93]">
                    Use a clear name that customers and
                    your team can easily understand.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-[#41373d]">
                      Description
                    </label>

                    <span className="text-xs text-[#a09298]">
                      {formData.description.length}/300
                    </span>
                  </div>

                  <textarea
                    name="description"
                    rows={6}
                    maxLength={300}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what products belong in this category..."
                    className="w-full resize-none rounded-xl border border-[#ddd4d0] bg-[#fcfaf9] px-4 py-3 text-sm leading-6 text-[#292126] outline-none transition placeholder:text-[#aaa0a5] focus:border-[#7d3657] focus:bg-white focus:ring-4 focus:ring-[#7d3657]/10"
                  />

                  <p className="mt-2 text-xs text-[#9a8d93]">
                    A short description helps keep your
                    catalog organized.
                  </p>
                </div>

                {/* Status */}
                <div className="rounded-2xl border border-[#e9e1dd] bg-[#fcfaf9] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          formData.isActive
                            ? 'bg-[#edf6f0] text-[#3e7655]'
                            : 'bg-[#f1eded] text-[#887b81]'
                        }`}
                      >
                        {formData.isActive ? (
                          <EyeIcon />
                        ) : (
                          <EyeOffIcon />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#30272c]">
                          Category Visibility
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#8c7e85]">
                          {formData.isActive
                            ? 'This category is currently active.'
                            : 'This category is currently inactive.'}
                        </p>
                      </div>
                    </div>

                    {/* Custom switch */}
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="peer sr-only"
                      />

                      <div className="relative h-7 w-12 rounded-full bg-[#d8d0cd] transition peer-checked:bg-[#6e2d4c] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6e2d4c]/10">
                        <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                      </div>

                      <span className="ml-3 text-sm font-medium text-[#51464c]">
                        {formData.isActive
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-[#eee7e3] pt-6 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `${ADMIN_BASE}/categories`
                      )
                    }
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !formData.name.trim()
                    }
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        <span className="ml-2">
                          Updating...
                        </span>
                      </>
                    ) : (
                      <>
                        <SaveIcon />
                        <span className="ml-2">
                          Save Changes
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </section>

          {/* ======================================================
              SIDE PANEL
          ====================================================== */}
          <aside className="space-y-5">

            {/* Preview */}
            <div className="overflow-hidden rounded-2xl border border-[#e6ded9] bg-white shadow-[0_12px_40px_rgba(53,31,41,0.05)]">
              <div className="border-b border-[#eee7e3] px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#96878e]">
                  Live Preview
                </p>
              </div>

              <div className="p-5">
                <div className="rounded-xl border border-[#ebe3df] bg-[#fcfaf9] p-4">

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f5ebef] text-[#6e2d4c]">
                      <FolderIcon />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold text-[#2d252a]">
                          {formData.name.trim() ||
                            'Category Name'}
                        </h3>

                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                            formData.isActive
                              ? 'bg-[#edf6f0] text-[#3e7655]'
                              : 'bg-[#f0eceb] text-[#887b81]'
                          }`}
                        >
                          {formData.isActive
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#85787f]">
                        {formData.description.trim() ||
                          'Your category description will appear here.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[#ebe3df] pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#9a8d93]">
                        Products
                      </span>

                      <span className="font-semibold text-[#5c4d54]">
                        Existing catalog
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status information */}
            <div className="overflow-hidden rounded-2xl bg-[#321d28] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <InfoIcon />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Category status
                  </p>

                  <p className="text-xs text-white/55">
                    Visibility settings
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      formData.isActive
                        ? 'bg-[#8bc49d]'
                        : 'bg-[#a99ba1]'
                    }`}
                  />

                  <span className="text-sm text-white/80">
                    {formData.isActive
                      ? 'Category is active'
                      : 'Category is inactive'}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-5 text-white/50">
                  You can change the visibility at any
                  time without removing the category or
                  its products.
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl border border-[#e6ded9] bg-white p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#96878e]">
                Good practice
              </p>

              <div className="mt-4 space-y-3">
                <Tip text="Keep category names short and recognizable." />
                <Tip text="Use descriptions to clarify what belongs in the collection." />
                <Tip text="Deactivate categories instead of deleting them when possible." />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* =============================================================
   TIP
============================================================= */

function Tip({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#f5ebef] text-[#6e2d4c]">
        <CheckIcon />
      </div>

      <p className="text-xs leading-5 text-[#776a71]">
        {text}
      </p>
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

function ArrowLeftIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M19 12H5M12 19l-7-7 7-7"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function EyeIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="m3 3 18 18"
        strokeLinecap="round"
      />
      <path
        d="M10.6 6.2A9.7 9.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3 3.7M6.2 6.8C3.8 8.5 2.5 12 2.5 12s3.5 6 9.5 6c1.2 0 2.3-.2 3.3-.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InfoIcon() {
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
        d="M12 10v6M12 7.5h.01"
        strokeLinecap="round"
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