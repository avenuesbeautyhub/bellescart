'use client';

import React, {
  useState,
  useEffect,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import {
  useAdminProduct,
  useAdminCategories,
  useUpdateProduct,
} from '@/hooks/user/useAdminQueries';
import { globalToast } from '@/utils/globalToast';

interface EditProductData {
  name: string;
  description: string;
  price: string;
  category: string;
  brand: string;
  quantity: string;
  tags: string;
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
}

interface ImagePreview {
  file: File;
  preview: string;
  id: string;
}

const ADMIN_BASE = '/belles-portel-25';

function ArrowLeftIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M19 12H5m7 7-7-7 7-7"
      />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M5 4h11l3 3v13H5V4Zm3 0v5h7V4M8 20v-5h8v5"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M12 16V4m0 0L7 9m5-5 5 5M5 14v5h14v-5"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
      />
    </svg>
  );
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      className="h-4 w-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="m6 6 12 12M18 6 6 18"
      />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
        d="m21 8-9-5-9 5m18 0-9 5m9-5v9l-9 5m0-9L3 8m9 5v9M3 8v9l9 5"
      />
    </svg>
  );
}

function getStatusStyle(
  status: EditProductData['status']
) {
  switch (status) {
    case 'active':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-100',
        dot: 'bg-emerald-500',
      };

    case 'inactive':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-100',
        dot: 'bg-red-500',
      };

    default:
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-100',
        dot: 'bg-amber-500',
      };
  }
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: productData,
    isLoading: isLoadingProduct,
  } = useAdminProduct(id);

  const { data: categoriesData } =
    useAdminCategories();

  const updateProductMutation =
    useUpdateProduct();

  const [formData, setFormData] =
    useState<EditProductData>({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      quantity: '',
      tags: '',
      status: 'active',
      featured: false,
    });

  const [existingImages, setExistingImages] =
    useState<any[]>([]);

  const [newImages, setNewImages] =
    useState<ImagePreview[]>([]);

  const [mainImageIndex, setMainImageIndex] =
    useState<number>(0);

  const [isDragging, setIsDragging] =
    useState(false);

  const product =
    productData?.data?.product || null;

  const categories =
    categoriesData?.data?.categories || [];

  useEffect(() => {
    if (!product) return;

    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      category:
        product.category?._id ||
        product.category ||
        '',
      brand: product.brand || '',
      quantity:
        product.quantity?.toString() || '',
      tags:
        product.tags?.join(', ') || '',
      status:
        product.status || 'active',
      featured:
        product.featured || false,
    });

    setExistingImages(product.images || []);

    // Set main image index to the image with isMain: true, or 0 by default
    const mainImageIdx = product.images?.findIndex((img: any) => img.isMain) ?? 0;
    setMainImageIndex(mainImageIdx);
  }, [product]);

  useEffect(() => {
    return () => {
      newImages.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [newImages]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
      type,
    } = e.target;

    if (type === 'checkbox') {
      const checked = (
        e.target as HTMLInputElement
      ).checked;

      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addImages = (files: File[]) => {
    const imageFiles = files.filter((file) =>
      file.type.startsWith('image/')
    );

    const previews: ImagePreview[] =
      imageFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id:
          Math.random()
            .toString(36)
            .substring(2, 11),
      }));

    setNewImages((prev) => {
      const updatedImages = [...prev, ...previews];

      // If there are no existing images and this is the first image, set it as main
      if (existingImages.length === 0 && prev.length === 0 && previews.length > 0) {
        setMainImageIndex(0);
      }

      return updatedImages;
    });
  };

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    addImages(
      Array.from(e.target.files || [])
    );

    e.target.value = '';
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    setIsDragging(false);

    addImages(
      Array.from(e.dataTransfer.files)
    );
  };

  const removeNewImage = (id: string) => {
    setNewImages((prev) => {
      const image = prev.find(
        (item) => item.id === id
      );

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      const newImages = prev.filter(
        (item) => item.id !== id
      );

      // Adjust mainImageIndex if needed
      const removedIndex = prev.findIndex(
        (item) => item.id === id
      );
      const absoluteRemovedIndex = existingImages.length + removedIndex;

      if (mainImageIndex === absoluteRemovedIndex) {
        // If the removed image was the main image, reset to 0
        setMainImageIndex(0);
      } else if (mainImageIndex > absoluteRemovedIndex) {
        // If an image before the main image was removed, adjust the index
        setMainImageIndex(mainImageIndex - 1);
      }

      return newImages;
    });
  };

  const removeExistingImage = (
    index: number
  ) => {
    setExistingImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);

      // If the removed image was the main image, reset to 0
      if (index === mainImageIndex) {
        setMainImageIndex(0);
      } else if (index < mainImageIndex) {
        // If an image before the main image was removed, adjust the index
        setMainImageIndex(mainImageIndex - 1);
      }

      return newImages;
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      globalToast.admin.error(
        'Missing Information',
        'Product name is required.'
      );
      return;
    }

    if (!formData.category) {
      globalToast.admin.error(
        'Missing Information',
        'Please select a category.'
      );
      return;
    }

    if (
      !formData.price ||
      Number(formData.price) < 0
    ) {
      globalToast.admin.error(
        'Invalid Price',
        'Please enter a valid product price.'
      );
      return;
    }

    if (
      formData.quantity === '' ||
      Number(formData.quantity) < 0
    ) {
      globalToast.admin.error(
        'Invalid Stock',
        'Please enter a valid stock quantity.'
      );
      return;
    }

    try {
      const formDataToSend =
        new FormData();

      Object.entries(formData).forEach(
        ([key, value]) => {
          if (key !== 'tags') {
            formDataToSend.append(
              key,
              value.toString()
            );
          }
        }
      );

      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      formDataToSend.append(
        'tags',
        JSON.stringify(tagsArray)
      );

      formDataToSend.append(
        'existingImages',
        JSON.stringify(existingImages)
      );

      newImages.forEach((image) => {
        formDataToSend.append(
          'images',
          image.file
        );
      });

      formDataToSend.append(
        'mainImageIndex',
        mainImageIndex.toString()
      );

      const response =
        await updateProductMutation.mutateAsync(
          {
            id,
            formData: formDataToSend,
          }
        );

      if (response.success) {
        globalToast.admin.success(
          'Product Updated',
          'Product has been updated successfully.'
        );

        router.push(
          `${ADMIN_BASE}/products`
        );
      } else {
        globalToast.admin.error(
          'Update Failed',
          response.message ||
            'Failed to update product.'
        );
      }
    } catch (error: any) {
      console.error(
        'Failed to update product:',
        error
      );

      globalToast.admin.error(
        'Network Error',
        error.message ||
          'Network error occurred.'
      );
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-[#f8f6f3]">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-[#e9e2de]" />

            <div className="mt-4 h-10 w-64 rounded bg-[#e9e2de]" />

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_330px]">
              <div className="h-[700px] rounded-2xl bg-white" />
              <div className="h-[500px] rounded-2xl bg-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6f3] px-5">
        <div className="w-full max-w-md rounded-3xl border border-[#e9e1dc] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5efec] text-[#806772]">
            <PackageIcon />
          </div>

          <h1 className="mt-5 font-serif text-2xl text-[#2c2327]">
            Product not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#887b76]">
            The product you're trying to edit
            could not be found.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                `${ADMIN_BASE}/products`
              )
            }
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#351d2d] px-5 text-sm font-semibold text-white"
          >
            <ArrowLeftIcon />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const mainImage =
    existingImages.find(
      (image) => image.isMain
    )?.url ||
    existingImages[0]?.url ||
    newImages[0]?.preview ||
    null;

  const statusStyle =
    getStatusStyle(formData.status);

  return (
    <div className="min-h-screen bg-[#f8f6f3] pb-28">
      {/* Header */}
      <header className="border-b border-[#e8e1dc] bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() =>
              router.push(
                `${ADMIN_BASE}/products`
              )
            }
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#796c70] transition hover:text-[#351d2d]"
          >
            <ArrowLeftIcon />
            Back to Products
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b8d87]">
                <span>Catalog</span>
                <span className="text-[#d0c5bf]">
                  /
                </span>
                <span>Products</span>
                <span className="text-[#d0c5bf]">
                  /
                </span>
                <span>Edit</span>
              </div>

              <h1 className="font-serif text-3xl font-medium tracking-tight text-[#282024] sm:text-4xl">
                Edit Product
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-[#827570]">
                Update product information,
                inventory, visibility and
                photography.
              </p>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
              />
              {formData.status}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Basic Information */}
              <section className="rounded-2xl border border-[#e9e1dc] bg-white shadow-[0_4px_24px_rgba(50,30,30,0.035)]">
                <div className="border-b border-[#eee7e3] px-5 py-5 sm:px-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b8d87]">
                    01
                  </p>

                  <h2 className="mt-1 font-serif text-xl text-[#2d2528]">
                    Product Information
                  </h2>

                  <p className="mt-1 text-xs text-[#948681]">
                    The essential information
                    customers will see.
                  </p>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Input
                      label="Product Name *"
                      name="name"
                      value={formData.name}
                      onChange={
                        handleInputChange
                      }
                      placeholder="Enter product name"
                      required
                    />

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#40363a]">
                        Price *
                      </label>

                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-serif text-base text-[#8f7e84]">
                          ₹
                        </span>

                        <input
                          type="number"
                          name="price"
                          value={
                            formData.price
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                          className="h-11 w-full rounded-xl border border-[#ded6d1] bg-[#fdfbf9] pl-9 pr-4 text-sm text-[#30272b] outline-none transition focus:border-[#8c6376] focus:bg-white focus:ring-4 focus:ring-[#8c6376]/10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#40363a]">
                        Category *
                      </label>

                      <select
                        name="category"
                        value={
                          formData.category
                        }
                        onChange={
                          handleInputChange
                        }
                        required
                        className="h-11 w-full rounded-xl border border-[#ded6d1] bg-[#fdfbf9] px-4 text-sm text-[#30272b] outline-none transition focus:border-[#8c6376] focus:bg-white focus:ring-4 focus:ring-[#8c6376]/10"
                      >
                        <option value="">
                          Select a category
                        </option>

                        {categories.map(
                          (category: any) => (
                            <option
                              key={
                                category._id
                              }
                              value={
                                category._id
                              }
                            >
                              {category.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <Input
                      label="Brand"
                      name="brand"
                      value={formData.brand}
                      onChange={
                        handleInputChange
                      }
                      placeholder="Enter brand name"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#40363a]">
                        Quantity / Stock *
                      </label>

                      <input
                        type="number"
                        name="quantity"
                        value={
                          formData.quantity
                        }
                        onChange={
                          handleInputChange
                        }
                        required
                        min="0"
                        placeholder="0"
                        className="h-11 w-full rounded-xl border border-[#ded6d1] bg-[#fdfbf9] px-4 text-sm text-[#30272b] outline-none transition focus:border-[#8c6376] focus:bg-white focus:ring-4 focus:ring-[#8c6376]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#40363a]">
                        Product Status
                      </label>

                      <select
                        name="status"
                        value={
                          formData.status
                        }
                        onChange={
                          handleInputChange
                        }
                        className="h-11 w-full rounded-xl border border-[#ded6d1] bg-[#fdfbf9] px-4 text-sm text-[#30272b] outline-none transition focus:border-[#8c6376] focus:bg-white focus:ring-4 focus:ring-[#8c6376]/10"
                      >
                        <option value="active">
                          Active
                        </option>
                        <option value="inactive">
                          Inactive
                        </option>
                        <option value="draft">
                          Draft
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-[#40363a]">
                        Description
                      </label>

                      <span className="text-[10px] text-[#a09691]">
                        {
                          formData.description
                            .length
                        }{' '}
                        characters
                      </span>
                    </div>

                    <textarea
                      name="description"
                      value={
                        formData.description
                      }
                      onChange={
                        handleInputChange
                      }
                      rows={6}
                      placeholder="Describe the product, materials, finish, design details and other customer-facing information..."
                      className="w-full resize-y rounded-xl border border-[#ded6d1] bg-[#fdfbf9] px-4 py-3 text-sm leading-6 text-[#30272b] outline-none transition placeholder:text-[#aaa09b] focus:border-[#8c6376] focus:bg-white focus:ring-4 focus:ring-[#8c6376]/10"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#40363a]">
                      Tags
                    </label>

                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={
                        handleInputChange
                      }
                      placeholder="jhumka, antique, gold, party wear"
                      className="h-11 w-full rounded-xl border border-[#ded6d1] bg-[#fdfbf9] px-4 text-sm text-[#30272b] outline-none transition placeholder:text-[#aaa09b] focus:border-[#8c6376] focus:bg-white focus:ring-4 focus:ring-[#8c6376]/10"
                    />

                    <p className="mt-1.5 text-[10px] text-[#9c908b]">
                      Separate multiple tags
                      with commas.
                    </p>
                  </div>

                  {/* Featured */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        featured:
                          !prev.featured,
                      }))
                    }
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                      formData.featured
                        ? 'border-[#d9c2ca] bg-[#faf4f6]'
                        : 'border-[#e5ddd8] bg-[#fdfbf9]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          formData.featured
                            ? 'bg-[#351d2d] text-white'
                            : 'bg-[#eee7e3] text-[#867874]'
                        }`}
                      >
                        <StarIcon
                          filled={
                            formData.featured
                          }
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#393033]">
                          Featured Product
                        </p>

                        <p className="mt-0.5 text-xs text-[#918580]">
                          Highlight this item in
                          featured collections.
                        </p>
                      </div>
                    </div>

                    <span
                      className={`relative h-6 w-11 rounded-full transition ${
                        formData.featured
                          ? 'bg-[#351d2d]'
                          : 'bg-[#d8d0cc]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                          formData.featured
                            ? 'left-6'
                            : 'left-1'
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </section>

              {/* Images */}
              <section className="rounded-2xl border border-[#e9e1dc] bg-white shadow-[0_4px_24px_rgba(50,30,30,0.035)]">
                <div className="border-b border-[#eee7e3] px-5 py-5 sm:px-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b8d87]">
                    02
                  </p>

                  <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                    <div>
                      <h2 className="font-serif text-xl text-[#2d2528]">
                        Product Photography
                      </h2>

                      <p className="mt-1 text-xs text-[#948681]">
                        Manage existing images or
                        add new product photography.
                      </p>
                    </div>

                    <span className="text-xs text-[#968a85]">
                      {existingImages.length +
                        newImages.length}{' '}
                      total
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {/* Existing */}
                  {existingImages.length >
                    0 && (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#40363a]">
                          Current Images
                        </h3>

                        <span className="text-[10px] text-[#a0948f]">
                          Click to set main image
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                        {existingImages.map(
                          (image, index) => (
                            <div
                              key={`${image.url}-${index}`}
                              className={`group relative overflow-hidden rounded-2xl border cursor-pointer ${
                                index === mainImageIndex
                                  ? 'border-[#a57689] ring-2 ring-[#a57689]/10'
                                  : 'border-[#e5ddd8]'
                              }`}
                              onClick={() => {
                                setMainImageIndex(index);
                                // Update isMain flag immediately for visual feedback
                                setExistingImages((prev) =>
                                  prev.map((img, i) => ({
                                    ...img,
                                    isMain: i === index
                                  }))
                                );
                              }}
                            >
                              <div className="aspect-square bg-[#f4efec]">
                                <img
                                  src={
                                    image.url ||
                                    '/placeholder-image.jpg'
                                  }
                                  alt={
                                    image.alt ||
                                    `Product image ${
                                      index + 1
                                    }`
                                  }
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                              </div>

                              {index === mainImageIndex && (
                                <span className="absolute left-2 top-2 rounded-full bg-[#351d2d] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white">
                                  Main
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeExistingImage(
                                    index
                                  );
                                }}
                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#8b696f] opacity-100 shadow-sm transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                                aria-label="Remove image"
                              >
                                <XIcon />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* New Images */}
                  {newImages.length > 0 && (
                    <div
                      className={
                        existingImages.length >
                        0
                          ? 'mt-7'
                          : ''
                      }
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#40363a]">
                          New Images
                        </h3>

                        <span className="text-[10px] text-[#a0948f]">
                          Set main after upload
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                        {newImages.map(
                          (image, index) => (
                            <div
                              key={image.id}
                              className="group relative overflow-hidden rounded-2xl border border-[#d8c7ce] bg-[#faf5f7]"
                            >
                              <div className="aspect-square">
                                <img
                                  src={
                                    image.preview
                                  }
                                  alt={`New product image ${
                                    index + 1
                                  }`}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-[#71495b] shadow-sm">
                                New
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  removeNewImage(
                                    image.id
                                  )
                                }
                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-sm transition hover:bg-red-50"
                                aria-label="Remove new image"
                              >
                                <XIcon />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upload */}
                  <div
                    className={`mt-6 rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-8 ${
                      isDragging
                        ? 'border-[#8d6177] bg-[#faf3f6]'
                        : 'border-[#ded5d0] bg-[#fcfaf9] hover:border-[#b89aa7] hover:bg-[#fdfaf8]'
                    }`}
                    onDragOver={
                      handleDragOver
                    }
                    onDragLeave={
                      handleDragLeave
                    }
                    onDrop={handleDrop}
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2ebe8] text-[#765563]">
                      <UploadIcon />
                    </div>

                    <h3 className="mt-3 text-sm font-semibold text-[#41373b]">
                      Add product images
                    </h3>

                    <p className="mt-1 text-xs text-[#988c87]">
                      Drag & drop images here, or
                      choose files from your device.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl border border-[#d9cfca] bg-white px-4 text-xs font-semibold text-[#5f5057] shadow-sm transition hover:border-[#a78a97] hover:bg-[#faf6f4]"
                    >
                      <UploadIcon />
                      Choose Images
                    </button>

                    <p className="mt-3 text-[10px] text-[#aaa09b]">
                      JPG, PNG, WEBP · Multiple files
                      supported
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={
                      handleImageSelect
                    }
                    className="hidden"
                  />
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-24">
              {/* Preview */}
              <section className="overflow-hidden rounded-2xl border border-[#e9e1dc] bg-white shadow-[0_4px_24px_rgba(50,30,30,0.035)]">
                <div className="border-b border-[#eee7e3] px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b8d87]">
                    Live Preview
                  </p>

                  <h2 className="mt-1 font-serif text-lg text-[#30272b]">
                    Store appearance
                  </h2>
                </div>

                <div className="p-4">
                  <div className="overflow-hidden rounded-2xl border border-[#e8dfda] bg-white">
                    <div className="relative aspect-square bg-[#f5f0ec]">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={
                            formData.name ||
                            'Product preview'
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#b4a6a0]">
                          <PackageIcon />
                        </div>
                      )}

                      {formData.featured && (
                        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#351d2d] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                          <StarIcon filled />
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#9b8c87]">
                        {formData.brand ||
                          'BellesCart'}
                      </p>

                      <h3 className="mt-1 line-clamp-2 font-serif text-lg leading-tight text-[#30272b]">
                        {formData.name ||
                          'Product Name'}
                      </h3>

                      <p className="mt-2 font-serif text-lg text-[#5d394c]">
                        ₹
                        {Number(
                          formData.price || 0
                        ).toLocaleString(
                          'en-IN'
                        )}
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-[#eee7e3] pt-3">
                        <span className="text-[10px] text-[#968984]">
                          {formData.quantity ||
                            0}{' '}
                          in stock
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-semibold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                          />
                          {formData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Inventory summary */}
              <section className="rounded-2xl border border-[#e9e1dc] bg-white p-5 shadow-[0_4px_24px_rgba(50,30,30,0.035)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b8d87]">
                  Inventory
                </p>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="font-serif text-3xl text-[#30272b]">
                      {formData.quantity ||
                        0}
                    </p>

                    <p className="mt-1 text-xs text-[#91847f]">
                      pieces available
                    </p>
                  </div>

                  <div
                    className={`rounded-xl px-3 py-2 text-right ${
                      Number(
                        formData.quantity || 0
                      ) <= 0
                        ? 'bg-red-50'
                        : Number(
                              formData.quantity ||
                                0
                            ) <= 5
                          ? 'bg-amber-50'
                          : 'bg-emerald-50'
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold uppercase ${
                        Number(
                          formData.quantity ||
                            0
                        ) <= 0
                          ? 'text-red-700'
                          : Number(
                                formData.quantity ||
                                  0
                              ) <= 5
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                      }`}
                    >
                      {Number(
                        formData.quantity || 0
                      ) <= 0
                        ? 'Out of stock'
                        : Number(
                              formData.quantity ||
                                0
                            ) <= 5
                          ? 'Low stock'
                          : 'Healthy'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Tips */}
              <section className="rounded-2xl bg-[#351d2d] p-5 text-white shadow-[0_8px_30px_rgba(53,29,45,0.15)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d9becb]">
                  Editing tip
                </p>

                <p className="mt-2 font-serif text-lg leading-6">
                  Keep your product
                  presentation consistent.
                </p>

                <p className="mt-2 text-xs leading-5 text-[#d9cbd1]">
                  Use clear photography, concise
                  descriptions and accurate stock
                  levels to create a better
                  customer experience.
                </p>
              </section>
            </aside>
          </div>

          {/* Bottom Actions */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ddd5d0] bg-white/95 px-4 py-3 shadow-[0_-6px_25px_rgba(40,25,25,0.07)] backdrop-blur-md sm:px-6">
            <div className="mx-auto flex max-w-[1400px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="hidden text-xs text-[#8e817c] sm:block">
                Changes are saved when you update
                the product.
              </div>

              <div className="flex w-full gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `${ADMIN_BASE}/products`
                    )
                  }
                  disabled={
                    updateProductMutation.isPending
                  }
                  className="h-11 flex-1 rounded-xl border border-[#dcd3ce] bg-white px-5 text-sm font-semibold text-[#62565b] transition hover:bg-[#f8f4f2] disabled:opacity-50 sm:flex-none"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    updateProductMutation.isPending
                  }
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#351d2d] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#47263d] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                >
                  {updateProductMutation.isPending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon />
                      Update Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}