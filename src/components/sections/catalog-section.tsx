"use client";

import React, { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { t, isRTL } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  DollarSign,
  Tag,
  Settings2,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryItem {
  id: string;
  labelEn: string;
  labelAr: string;
  color: string; // "sage" | "sand" | "terracotta" | "pink" | "amber" | "emerald"
}

interface Product {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  imageUrl: string;
  category: string; // category id or "" for uncategorized
  available: boolean;
}

interface ProductFormData {
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: string;
  imageUrl: string;
  category: string;
  available: boolean;
}

interface CategoryFormData {
  labelEn: string;
  labelAr: string;
  color: string;
}

// ─── Color Map ────────────────────────────────────────────────────────────────

const colorMap: Record<string, {
  bg: string;
  iconBg: string;
  text: string;
  border: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
}> = {
  sage: {
    bg: "bg-sage-50 dark:bg-sage-900/20",
    iconBg: "bg-sage-100 dark:bg-sage-900/30",
    text: "text-sage-700 dark:text-sage-400",
    border: "border-sage-200 dark:border-sage-800/40",
    activeBg: "bg-sage-100 dark:bg-sage-800/40",
    activeText: "text-sage-700 dark:text-sage-300",
    activeBorder: "border-sage-300 dark:border-sage-700",
  },
  sand: {
    bg: "bg-sand-50 dark:bg-sand-900/20",
    iconBg: "bg-sand-100 dark:bg-sand-900/30",
    text: "text-sand-700 dark:text-sand-400",
    border: "border-sand-200 dark:border-sand-800/40",
    activeBg: "bg-sand-100 dark:bg-sand-800/40",
    activeText: "text-sand-700 dark:text-sand-300",
    activeBorder: "border-sand-300 dark:border-sand-700",
  },
  terracotta: {
    bg: "bg-terracotta-50 dark:bg-terracotta-900/20",
    iconBg: "bg-terracotta-100 dark:bg-terracotta-900/30",
    text: "text-terracotta-700 dark:text-terracotta-400",
    border: "border-terracotta-200 dark:border-terracotta-800/40",
    activeBg: "bg-terracotta-100 dark:bg-terracotta-800/40",
    activeText: "text-terracotta-700 dark:text-terracotta-300",
    activeBorder: "border-terracotta-300 dark:border-terracotta-700",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-900/20",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-700 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-800/40",
    activeBg: "bg-pink-100 dark:bg-pink-800/40",
    activeText: "text-pink-700 dark:text-pink-300",
    activeBorder: "border-pink-300 dark:border-pink-700",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/40",
    activeBg: "bg-amber-100 dark:bg-amber-800/40",
    activeText: "text-amber-700 dark:text-amber-300",
    activeBorder: "border-amber-300 dark:border-amber-700",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/40",
    activeBg: "bg-emerald-100 dark:bg-emerald-800/40",
    activeText: "text-emerald-700 dark:text-emerald-300",
    activeBorder: "border-emerald-300 dark:border-emerald-700",
  },
};

const availableColors = ["sage", "sand", "terracotta", "pink", "amber", "emerald"] as const;

// Color circle preview swatches for the color picker
const colorCircleMap: Record<string, string> = {
  sage: "bg-sage-400",
  sand: "bg-sand-400",
  terracotta: "bg-terracotta-400",
  pink: "bg-pink-400",
  amber: "bg-amber-400",
  emerald: "bg-emerald-400",
};

// Fallback neutral styling for uncategorized or unknown categories
const neutralStyles = {
  bg: "bg-gray-50 dark:bg-gray-900/20",
  iconBg: "bg-gray-100 dark:bg-gray-900/30",
  text: "text-gray-700 dark:text-gray-400",
  border: "border-gray-200 dark:border-gray-800/40",
  activeBg: "bg-gray-100 dark:bg-gray-800/40",
  activeText: "text-gray-700 dark:text-gray-300",
  activeBorder: "border-gray-300 dark:border-gray-700",
};

// ─── Initial Data ─────────────────────────────────────────────────────────────

const initialCategories: CategoryItem[] = [
  { id: "skincare", labelEn: "Skincare", labelAr: "العناية بالبشرة", color: "sage" },
  { id: "hair", labelEn: "Hair", labelAr: "الشعر", color: "amber" },
  { id: "nails", labelEn: "Nails", labelAr: "الأظافر", color: "pink" },
  { id: "makeup", labelEn: "Makeup", labelAr: "المكياج", color: "terracotta" },
];

const initialProducts: Product[] = [
  {
    id: 1,
    nameEn: "Facial Treatment",
    nameAr: "علاج الوجه",
    descriptionEn: "Deep cleansing facial with exfoliation, extraction, and hydrating mask for radiant skin.",
    descriptionAr: "تنظيف عميق للوجه مع تقشير وإزالة الشوائب وقناع مرطب لبشرة مشرقة.",
    price: 250,
    imageUrl: "",
    category: "skincare",
    available: true,
  },
  {
    id: 2,
    nameEn: "Hair Coloring",
    nameAr: "صبغة الشعر",
    descriptionEn: "Professional hair coloring service with premium products and expert color matching.",
    descriptionAr: "خدمة صبغة شعر احترافية بمنتجات ممتازة ومطابقة لونية دقيقة.",
    price: 350,
    imageUrl: "",
    category: "hair",
    available: true,
  },
  {
    id: 3,
    nameEn: "Manicure",
    nameAr: "مناكير",
    descriptionEn: "Classic manicure with nail shaping, cuticle care, hand massage, and polish application.",
    descriptionAr: "مناكير كلاسيكي مع تشكيل الأظافر وعلاج البشرة وتدليك اليدين وطلاء الأظافر.",
    price: 120,
    imageUrl: "",
    category: "nails",
    available: true,
  },
  {
    id: 4,
    nameEn: "Pedicure",
    nameAr: "بديكير",
    descriptionEn: "Relaxing pedicure with foot soak, exfoliation, nail care, and moisturizing treatment.",
    descriptionAr: "بديكير مريح مع نقع القدمين وتقشير وعناية بالأظافر وعلاج مرطب.",
    price: 150,
    imageUrl: "",
    category: "nails",
    available: false,
  },
  {
    id: 5,
    nameEn: "Bridal Makeup",
    nameAr: "مكياج العروس",
    descriptionEn: "Full bridal makeup package with trial session, premium products, and long-lasting finish.",
    descriptionAr: "باقة مكياج العروس الكاملة مع جلسة تجريبية ومنتجات ممتازة وثبات طويل.",
    price: 800,
    imageUrl: "",
    category: "makeup",
    available: true,
  },
  {
    id: 6,
    nameEn: "Keratin Treatment",
    nameAr: "علاج الكيراتين",
    descriptionEn: "Smoothing keratin treatment that eliminates frizz and adds shine for up to 3 months.",
    descriptionAr: "علاج فرد بالكيراتين يزيل التجعد ويضيف لمعان لمدة تصل إلى 3 أشهر.",
    price: 600,
    imageUrl: "",
    category: "hair",
    available: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emptyProductFormData: ProductFormData = {
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  price: "",
  imageUrl: "",
  category: "",
  available: true,
};

const emptyCategoryFormData: CategoryFormData = {
  labelEn: "",
  labelAr: "",
  color: "sage",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryStyles(cat: CategoryItem | undefined, key: "bg" | "iconBg" | "text" | "border" | "activeBg" | "activeText" | "activeBorder"): string {
  if (!cat) return neutralStyles[key];
  const map = colorMap[cat.color];
  if (!map) return neutralStyles[key];
  return map[key];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CatalogSection() {
  const { locale } = useAppStore();
  const rtl = isRTL(locale);

  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Product dialog states
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyProductFormData);

  // Category management dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>(emptyCategoryFormData);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);

  // ─── Derived Data ─────────────────────────────────────────────────────────

  const hasUncategorized = useMemo(() => {
    return products.some((p) => !p.category || !categories.find((c) => c.id === p.category));
  }, [products, categories]);

  const getCategoryLabel = (catId: string): string => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return t(locale, "catalog.uncategorized");
    return rtl ? cat.labelAr : cat.labelEn;
  };

  const getCategoryById = (catId: string): CategoryItem | undefined => {
    return categories.find((c) => c.id === catId);
  };

  // ─── Filtering ────────────────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const nameMatch = rtl
        ? p.nameAr.toLowerCase().includes(searchQuery.toLowerCase())
        : p.nameEn.toLowerCase().includes(searchQuery.toLowerCase());

      let categoryMatch = true;
      if (activeCategory === "uncategorized") {
        categoryMatch = !p.category || !categories.find((c) => c.id === p.category);
      } else if (activeCategory !== "all") {
        categoryMatch = p.category === activeCategory;
      }

      return nameMatch && categoryMatch;
    });
  }, [products, searchQuery, activeCategory, rtl, categories]);

  // ─── Product Handlers ─────────────────────────────────────────────────────

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      ...emptyProductFormData,
      category: categories.length > 0 ? categories[0].id : "",
    });
    setProductDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      descriptionEn: product.descriptionEn,
      descriptionAr: product.descriptionAr,
      price: String(product.price),
      imageUrl: product.imageUrl,
      category: product.category,
      available: product.available,
    });
    setProductDialogOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleSaveProduct = () => {
    const price = parseFloat(formData.price) || 0;

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                nameEn: formData.nameEn,
                nameAr: formData.nameAr,
                descriptionEn: formData.descriptionEn,
                descriptionAr: formData.descriptionAr,
                price,
                imageUrl: formData.imageUrl,
                category: formData.category,
                available: formData.available,
              }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: Math.max(0, ...products.map((p) => p.id)) + 1,
        nameEn: formData.nameEn,
        nameAr: formData.nameAr,
        descriptionEn: formData.descriptionEn,
        descriptionAr: formData.descriptionAr,
        price,
        imageUrl: formData.imageUrl,
        category: formData.category,
        available: formData.available,
      };
      setProducts((prev) => [...prev, newProduct]);
    }

    setProductDialogOpen(false);
    setEditingProduct(null);
    setFormData(emptyProductFormData);
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    setDeleteDialogOpen(false);
    setDeletingProduct(null);
  };

  // ─── Category Handlers ────────────────────────────────────────────────────

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData(emptyCategoryFormData);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryFormData({
      labelEn: cat.labelEn,
      labelAr: cat.labelAr,
      color: cat.color,
    });
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      // Update existing category
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, labelEn: categoryFormData.labelEn, labelAr: categoryFormData.labelAr, color: categoryFormData.color }
            : c
        )
      );
      setEditingCategory(null);
    } else {
      // Add new category
      const slug = slugify(categoryFormData.labelEn) || `cat-${Date.now()}`;
      const newCategory: CategoryItem = {
        id: slug,
        labelEn: categoryFormData.labelEn,
        labelAr: categoryFormData.labelAr,
        color: categoryFormData.color,
      };
      setCategories((prev) => [...prev, newCategory]);
    }
    setCategoryFormData(emptyCategoryFormData);
  };

  const handleOpenDeleteCategory = (cat: CategoryItem) => {
    setDeletingCategory(cat);
    setDeleteCategoryDialogOpen(true);
  };

  const handleConfirmDeleteCategory = () => {
    if (!deletingCategory) return;
    // Move products in this category to uncategorized (category: "")
    setProducts((prev) =>
      prev.map((p) => (p.category === deletingCategory.id ? { ...p, category: "" } : p))
    );
    // Remove the category
    setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
    // If we were viewing this category, switch to all
    if (activeCategory === deletingCategory.id) {
      setActiveCategory("all");
    }
    setDeleteCategoryDialogOpen(false);
    setDeletingCategory(null);
  };

  // ─── Category Pills ──────────────────────────────────────────────────────

  const categoryPills = useMemo(() => {
    const pills: { key: string; label: string; cat?: CategoryItem }[] = [
      { key: "all", label: t(locale, "catalog.allCategories") },
    ];
    categories.forEach((cat) => {
      pills.push({
        key: cat.id,
        label: rtl ? cat.labelAr : cat.labelEn,
        cat,
      });
    });
    if (hasUncategorized) {
      pills.push({
        key: "uncategorized",
        label: t(locale, "catalog.uncategorized"),
      });
    }
    return pills;
  }, [categories, rtl, locale, hasUncategorized]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className={cn("text-2xl font-bold tracking-tight", rtl && "font-arabic")}>
            {t(locale, "catalog.title")}
          </h2>
          <p className={cn("text-muted-foreground text-sm", rtl && "font-arabic")}>
            {t(locale, "catalog.subtitle")}
          </p>
        </div>

        {/* Search + Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground",
                rtl ? "right-3" : "left-3"
              )}
            />
            <Input
              placeholder={t(locale, "search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                rtl ? "pr-9 pl-3" : "pl-9 pr-3",
                rtl && "font-arabic"
              )}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setCategoryDialogOpen(true);
              handleOpenAddCategory();
            }}
            className={cn("gap-2 shrink-0", rtl && "font-arabic")}
          >
            <Settings2 className="w-4 h-4" />
            {t(locale, "catalog.manageCategories")}
          </Button>
          <Button
            onClick={handleOpenAdd}
            className={cn("gap-2 shrink-0", rtl && "font-arabic")}
          >
            <Plus className="w-4 h-4" />
            {t(locale, "catalog.addProduct")}
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categoryPills.map((pill) => {
          const isActive = activeCategory === pill.key;
          const colors = pill.cat && isActive
            ? colorMap[pill.cat.color]
            : null;

          return (
            <button
              key={pill.key}
              onClick={() => setActiveCategory(pill.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
                isActive
                  ? colors
                    ? cn(colors.activeBg, colors.activeText, colors.activeBorder)
                    : pill.key === "uncategorized"
                      ? cn(neutralStyles.activeBg, neutralStyles.activeText, neutralStyles.activeBorder)
                      : "bg-primary/10 text-primary border-primary/30"
                  : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground",
                rtl && "font-arabic"
              )}
            >
              {pill.key !== "all" && (
                <Tag className="w-3.5 h-3.5" />
              )}
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className={cn("flex flex-col items-center justify-center py-16 text-muted-foreground", rtl && "font-arabic")}>
          <Package className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">{t(locale, "noData")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const cat = getCategoryById(product.category);
            const isUncategorized = !product.category || !cat;

            return (
              <Card
                key={product.id}
                className={cn(
                  "py-0 overflow-hidden group hover:shadow-md transition-shadow duration-200",
                  !product.available && "opacity-75"
                )}
              >
                {/* Image Placeholder */}
                <div
                  className={cn(
                    "relative h-40 flex items-center justify-center",
                    isUncategorized
                      ? neutralStyles.iconBg
                      : getCategoryStyles(cat, "iconBg")
                  )}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={rtl ? product.nameAr : product.nameEn}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package
                      className={cn(
                        "w-12 h-12",
                        isUncategorized
                          ? "text-gray-500 dark:text-gray-400"
                          : getCategoryStyles(cat, "text")
                      )}
                    />
                  )}

                  {/* Availability Badge */}
                  <div className={cn("absolute top-2", rtl ? "right-2" : "left-2")}>
                    {product.available ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 text-[10px] font-medium border",
                          "bg-sage-50 dark:bg-sage-900/20",
                          "text-sage-700 dark:text-sage-400",
                          "border-sage-200 dark:border-sage-800/40"
                        )}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {t(locale, "available")}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 text-[10px] font-medium border",
                          "bg-red-50 dark:bg-red-900/20",
                          "text-red-600 dark:text-red-400",
                          "border-red-200 dark:border-red-800/40"
                        )}
                      >
                        <XCircle className="w-3 h-3" />
                        {t(locale, "unavailable")}
                      </Badge>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className={cn("absolute top-2", rtl ? "left-2" : "right-2")}>
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 text-[10px] font-medium border",
                        isUncategorized
                          ? cn(neutralStyles.bg, neutralStyles.text, neutralStyles.border)
                          : cn(
                              getCategoryStyles(cat, "bg"),
                              getCategoryStyles(cat, "text"),
                              getCategoryStyles(cat, "border")
                            )
                      )}
                    >
                      {isUncategorized ? t(locale, "catalog.uncategorized") : getCategoryLabel(product.category)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Name & Price */}
                  <div>
                    <h3 className={cn("font-semibold text-sm leading-tight line-clamp-1", rtl && "font-arabic")}>
                      {rtl ? product.nameAr : product.nameEn}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <DollarSign className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-sm font-bold text-primary tabular-nums">
                        {product.price}
                      </span>
                      <span className={cn("text-xs text-muted-foreground", rtl && "font-arabic")}>
                        {rtl ? "ر.س" : "SAR"}
                      </span>
                    </div>
                  </div>

                  {/* Description Snippet */}
                  <p className={cn("text-xs text-muted-foreground line-clamp-2 leading-relaxed", rtl && "font-arabic")}>
                    {rtl ? product.descriptionAr : product.descriptionEn}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(product)}
                      className={cn("gap-1.5 text-xs h-8 flex-1", rtl && "font-arabic")}
                    >
                      <Pencil className="w-3 h-3" />
                      {t(locale, "edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDelete(product)}
                      className={cn(
                        "gap-1.5 text-xs h-8 flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800/40",
                        rtl && "font-arabic"
                      )}
                    >
                      <Trash2 className="w-3 h-3" />
                      {t(locale, "delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent
          className={cn("sm:max-w-lg", rtl && "font-arabic")}
          dir={rtl ? "rtl" : "ltr"}
        >
          <DialogHeader className={rtl && "items-end"}>
            <DialogTitle className={rtl && "text-right"}>
              {editingProduct
                ? t(locale, "catalog.editProduct")
                : t(locale, "catalog.addProduct")}
            </DialogTitle>
            <DialogDescription className={rtl && "text-right"}>
              {editingProduct
                ? rtl
                  ? "قم بتعديل تفاصيل المنتج"
                  : "Update product details"
                : rtl
                  ? "أضف منتج أو خدمة جديدة إلى الكتالوج"
                  : "Add a new product or service to the catalog"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
            {/* English Name */}
            <div className="space-y-2">
              <Label className={rtl && "text-right block"} htmlFor="nameEn">
                {t(locale, "catalog.productName")}
              </Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nameEn: e.target.value }))
                }
                placeholder={rtl ? "اسم المنتج بالإنجليزية" : "Product name in English"}
                dir="ltr"
              />
            </div>

            {/* Arabic Name */}
            <div className="space-y-2">
              <Label className="text-right block font-arabic" htmlFor="nameAr">
                {t(locale, "catalog.productNameAr")}
              </Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nameAr: e.target.value }))
                }
                placeholder="اسم المنتج بالعربية"
                className="text-right font-arabic"
                dir="rtl"
              />
            </div>

            {/* English Description */}
            <div className="space-y-2">
              <Label className={rtl && "text-right block"} htmlFor="descEn">
                {t(locale, "catalog.productDescription")}
              </Label>
              <Textarea
                id="descEn"
                value={formData.descriptionEn}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descriptionEn: e.target.value,
                  }))
                }
                placeholder={rtl ? "الوصف بالإنجليزية" : "Description in English"}
                rows={3}
                dir="ltr"
              />
            </div>

            {/* Arabic Description */}
            <div className="space-y-2">
              <Label className="text-right block font-arabic" htmlFor="descAr">
                {t(locale, "catalog.productDescriptionAr")}
              </Label>
              <Textarea
                id="descAr"
                value={formData.descriptionAr}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descriptionAr: e.target.value,
                  }))
                }
                placeholder="الوصف بالعربية"
                rows={3}
                className="text-right font-arabic"
                dir="rtl"
              />
            </div>

            {/* Price & Category Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Price */}
              <div className="space-y-2">
                <Label className={rtl && "text-right block"} htmlFor="price">
                  {t(locale, "catalog.productPrice")}
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="0.00"
                  className="tabular-nums"
                  dir="ltr"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className={rtl && "text-right block"}>
                  {t(locale, "catalog.productCategory")}
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: val,
                    }))
                  }
                >
                  <SelectTrigger className={cn("w-full", rtl && "font-arabic")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id}
                        className={rtl ? "font-arabic" : ""}
                      >
                        {rtl ? cat.labelAr : cat.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label className={rtl && "text-right block"} htmlFor="imageUrl">
                {t(locale, "catalog.productImage")}
              </Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    imageUrl: e.target.value,
                  }))
                }
                placeholder={rtl ? "رابط الصورة (اختياري)" : "Image URL (optional)"}
                dir="ltr"
              />
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
              <Label className={cn("cursor-pointer", rtl && "font-arabic")} htmlFor="availability">
                {t(locale, "catalog.availability")}
              </Label>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs",
                    formData.available
                      ? "text-sage-600 dark:text-sage-400"
                      : "text-red-500 dark:text-red-400",
                    rtl && "font-arabic"
                  )}
                >
                  {formData.available ? t(locale, "available") : t(locale, "unavailable")}
                </span>
                <Switch
                  id="availability"
                  checked={formData.available}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, available: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProductDialogOpen(false)}
              className={rtl ? "font-arabic" : ""}
            >
              {t(locale, "cancel")}
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={!formData.nameEn.trim() && !formData.nameAr.trim()}
              className={rtl ? "font-arabic" : ""}
            >
              {t(locale, "save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir={rtl ? "rtl" : "ltr"}>
          <AlertDialogHeader className={rtl && "items-end"}>
            <AlertDialogTitle className={cn(rtl && "font-arabic text-right")}>
              {t(locale, "catalog.deleteProduct")}
            </AlertDialogTitle>
            <AlertDialogDescription className={cn(rtl && "font-arabic text-right")}>
              {t(locale, "catalog.deleteConfirm")}
              {deletingProduct && (
                <span className="font-semibold block mt-1">
                  &quot;{rtl ? deletingProduct.nameAr : deletingProduct.nameEn}&quot;
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={rtl ? "font-arabic" : ""}>
              {t(locale, "cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {t(locale, "delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manage Categories Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent
          className={cn("sm:max-w-lg", rtl && "font-arabic")}
          dir={rtl ? "rtl" : "ltr"}
        >
          <DialogHeader className={rtl && "items-end"}>
            <DialogTitle className={rtl && "text-right"}>
              {t(locale, "catalog.manageCategories")}
            </DialogTitle>
            <DialogDescription className={rtl && "text-right"}>
              {rtl
                ? "أضف أو عدّل أو احذف فئات المنتجات"
                : "Add, edit, or remove product categories"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
            {/* Add/Edit Category Form */}
            <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
              <h4 className={cn("text-sm font-semibold", rtl && "font-arabic")}>
                {editingCategory ? t(locale, "catalog.editCategory") : t(locale, "catalog.addCategory")}
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* English Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs" htmlFor="catNameEn">
                    {t(locale, "catalog.categoryName")}
                  </Label>
                  <Input
                    id="catNameEn"
                    value={categoryFormData.labelEn}
                    onChange={(e) =>
                      setCategoryFormData((prev) => ({ ...prev, labelEn: e.target.value }))
                    }
                    placeholder={rtl ? "اسم الفئة بالإنجليزية" : "Category name in English"}
                    dir="ltr"
                    className="text-sm"
                  />
                </div>

                {/* Arabic Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-arabic text-right block" htmlFor="catNameAr">
                    {t(locale, "catalog.categoryNameAr")}
                  </Label>
                  <Input
                    id="catNameAr"
                    value={categoryFormData.labelAr}
                    onChange={(e) =>
                      setCategoryFormData((prev) => ({ ...prev, labelAr: e.target.value }))
                    }
                    placeholder="اسم الفئة بالعربية"
                    dir="rtl"
                    className="text-sm text-right font-arabic"
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {rtl ? "اللون" : "Color"}
                </Label>
                <div className="flex items-center gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setCategoryFormData((prev) => ({ ...prev, color }))
                      }
                      className={cn(
                        "w-7 h-7 rounded-full transition-all duration-200 border-2",
                        colorCircleMap[color],
                        categoryFormData.color === color
                          ? "border-foreground scale-110 ring-2 ring-foreground/20"
                          : "border-transparent hover:scale-105"
                      )}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Save / Cancel buttons for the form */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={handleSaveCategory}
                  disabled={!categoryFormData.labelEn.trim() && !categoryFormData.labelAr.trim()}
                  className={cn("gap-1.5 text-xs", rtl && "font-arabic")}
                >
                  <Plus className="w-3 h-3" />
                  {editingCategory ? t(locale, "save") : t(locale, "add")}
                </Button>
                {editingCategory && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryFormData(emptyCategoryFormData);
                    }}
                    className={cn("text-xs", rtl && "font-arabic")}
                  >
                    {t(locale, "cancel")}
                  </Button>
                )}
              </div>
            </div>

            {/* Category List */}
            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className={cn("text-sm text-muted-foreground text-center py-4", rtl && "font-arabic")}>
                  {rtl ? "لا توجد فئات بعد" : "No categories yet"}
                </p>
              ) : (
                categories.map((cat) => {
                  const catColor = colorMap[cat.color];
                  return (
                    <div
                      key={cat.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                        catColor
                          ? cn(catColor.bg, catColor.border)
                          : cn(neutralStyles.bg, neutralStyles.border)
                      )}
                    >
                      {/* Color dot */}
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full shrink-0",
                          colorCircleMap[cat.color] || "bg-gray-400"
                        )}
                      />

                      {/* Category label */}
                      <div className="flex-1 min-w-0">
                        <span className={cn("text-sm font-medium", catColor ? catColor.text : neutralStyles.text)}>
                          {rtl ? cat.labelAr : cat.labelEn}
                        </span>
                        <span className={cn("text-xs text-muted-foreground ms-2", rtl && "font-arabic")}>
                          {rtl ? cat.labelEn : cat.labelAr}
                        </span>
                      </div>

                      {/* Product count */}
                      <span className={cn("text-xs text-muted-foreground tabular-nums shrink-0", rtl && "font-arabic")}>
                        {products.filter((p) => p.category === cat.id).length}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditCategory(cat)}
                          className="gap-1 text-xs h-7 w-7 p-0"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteCategory(cat)}
                          className="gap-1 text-xs h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCategoryDialogOpen(false);
                setEditingCategory(null);
                setCategoryFormData(emptyCategoryFormData);
              }}
              className={rtl ? "font-arabic" : ""}
            >
              {t(locale, "close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation AlertDialog */}
      <AlertDialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <AlertDialogContent dir={rtl ? "rtl" : "ltr"}>
          <AlertDialogHeader className={rtl && "items-end"}>
            <AlertDialogTitle className={cn(rtl && "font-arabic text-right")}>
              {t(locale, "catalog.deleteCategory")}
            </AlertDialogTitle>
            <AlertDialogDescription className={cn(rtl && "font-arabic text-right")}>
              {t(locale, "catalog.deleteCategoryConfirm")}
              {deletingCategory && (
                <span className="font-semibold block mt-1">
                  &quot;{rtl ? deletingCategory.labelAr : deletingCategory.labelEn}&quot;
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={rtl ? "font-arabic" : ""}>
              {t(locale, "cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteCategory}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {t(locale, "delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
