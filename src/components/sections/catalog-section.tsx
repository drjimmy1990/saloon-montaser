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

type Category = "skincare" | "hair" | "nails" | "makeup";

interface Product {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  imageUrl: string;
  category: Category;
  available: boolean;
}

interface ProductFormData {
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: string;
  imageUrl: string;
  category: Category;
  available: boolean;
}

// ─── Category Config ──────────────────────────────────────────────────────────

const categoryConfig: Record<
  Category,
  { label: string; labelAr: string; bgColor: string; textColor: string; borderColor: string }
> = {
  skincare: {
    label: "Skincare",
    labelAr: "العناية بالبشرة",
    bgColor: "bg-sage-50 dark:bg-sage-900/20",
    textColor: "text-sage-700 dark:text-sage-400",
    borderColor: "border-sage-200 dark:border-sage-800/40",
  },
  hair: {
    label: "Hair",
    labelAr: "الشعر",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    textColor: "text-amber-700 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800/40",
  },
  nails: {
    label: "Nails",
    labelAr: "الأظافر",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    textColor: "text-pink-700 dark:text-pink-400",
    borderColor: "border-pink-200 dark:border-pink-800/40",
  },
  makeup: {
    label: "Makeup",
    labelAr: "المكياج",
    bgColor: "bg-terracotta-50 dark:bg-terracotta-900/20",
    textColor: "text-terracotta-700 dark:text-terracotta-400",
    borderColor: "border-terracotta-200 dark:border-terracotta-800/40",
  },
};

const categoryPillColors: Record<
  Category,
  { activeBg: string; activeText: string; activeBorder: string }
> = {
  skincare: {
    activeBg: "bg-sage-100 dark:bg-sage-800/40",
    activeText: "text-sage-700 dark:text-sage-300",
    activeBorder: "border-sage-300 dark:border-sage-700",
  },
  hair: {
    activeBg: "bg-amber-100 dark:bg-amber-800/40",
    activeText: "text-amber-700 dark:text-amber-300",
    activeBorder: "border-amber-300 dark:border-amber-700",
  },
  nails: {
    activeBg: "bg-pink-100 dark:bg-pink-800/40",
    activeText: "text-pink-700 dark:text-pink-300",
    activeBorder: "border-pink-300 dark:border-pink-700",
  },
  makeup: {
    activeBg: "bg-orange-100 dark:bg-orange-800/40",
    activeText: "text-orange-700 dark:text-orange-300",
    activeBorder: "border-orange-300 dark:border-orange-700",
  },
};

const productImageColors: Record<Category, string> = {
  skincare: "bg-sage-100 dark:bg-sage-900/30",
  hair: "bg-amber-100 dark:bg-amber-900/30",
  nails: "bg-pink-100 dark:bg-pink-900/30",
  makeup: "bg-orange-100 dark:bg-orange-900/30",
};

const productIconColors: Record<Category, string> = {
  skincare: "text-sage-500 dark:text-sage-400",
  hair: "text-amber-500 dark:text-amber-400",
  nails: "text-pink-500 dark:text-pink-400",
  makeup: "text-orange-500 dark:text-orange-400",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

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

// ─── Helper ───────────────────────────────────────────────────────────────────

const emptyFormData: ProductFormData = {
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  price: "",
  imageUrl: "",
  category: "skincare",
  available: true,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CatalogSection() {
  const { locale } = useAppStore();
  const rtl = isRTL(locale);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Dialog states
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);

  // ─── Filtering ────────────────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const nameMatch = rtl
        ? p.nameAr.toLowerCase().includes(searchQuery.toLowerCase())
        : p.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
      const categoryMatch =
        activeCategory === "all" || p.category === activeCategory;
      return nameMatch && categoryMatch;
    });
  }, [products, searchQuery, activeCategory, rtl]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData(emptyFormData);
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
      // Update existing
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
      // Add new
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
    setFormData(emptyFormData);
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    setDeleteDialogOpen(false);
    setDeletingProduct(null);
  };

  // ─── Category Pills ──────────────────────────────────────────────────────

  const categoryPills = [
    { key: "all", labelEn: "All Categories", labelAr: "جميع الفئات", i18nKey: "catalog.allCategories" },
    { key: "skincare", labelEn: "Skincare", labelAr: "العناية بالبشرة", i18nKey: "" },
    { key: "hair", labelEn: "Hair", labelAr: "الشعر", i18nKey: "" },
    { key: "nails", labelEn: "Nails", labelAr: "الأظافر", i18nKey: "" },
    { key: "makeup", labelEn: "Makeup", labelAr: "المكياج", i18nKey: "" },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2
            className={cn(
              "text-2xl font-bold tracking-tight",
              rtl && "font-arabic text-right"
            )}
          >
            {t(locale, "catalog.title")}
          </h2>
          <p
            className={cn(
              "text-muted-foreground text-sm",
              rtl && "font-arabic text-right"
            )}
          >
            {t(locale, "catalog.subtitle")}
          </p>
        </div>

        {/* Search + Add Button */}
        <div
          className={cn(
            "flex flex-col sm:flex-row gap-3",
            rtl && "sm:flex-row-reverse"
          )}
        >
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
                rtl && "font-arabic text-right"
              )}
            />
          </div>
          <Button
            onClick={handleOpenAdd}
            className={cn(
              "gap-2 shrink-0",
              rtl && "font-arabic flex-row-reverse"
            )}
          >
            <Plus className="w-4 h-4" />
            {t(locale, "catalog.addProduct")}
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        className={cn(
          "flex flex-wrap gap-2",
          rtl && "flex-row-reverse justify-end"
        )}
      >
        {categoryPills.map((pill) => {
          const isActive = activeCategory === pill.key;
          const catKey = pill.key as Category;
          const colors =
            pill.key !== "all" && isActive
              ? categoryPillColors[catKey]
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
                    : "bg-primary/10 text-primary border-primary/30"
                  : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground",
                rtl && "font-arabic"
              )}
            >
              {pill.key !== "all" && (
                <Tag className="w-3.5 h-3.5" />
              )}
              {rtl ? pill.labelAr : pill.labelEn}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center py-16 text-muted-foreground",
            rtl && "font-arabic"
          )}
        >
          <Package className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">{t(locale, "noData")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const catConfig = categoryConfig[product.category];
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
                    productImageColors[product.category]
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
                        productIconColors[product.category]
                      )}
                    />
                  )}

                  {/* Availability Badge */}
                  <div className="absolute top-2 start-2">
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
                  <div className="absolute top-2 end-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 text-[10px] font-medium border",
                        catConfig.bgColor,
                        catConfig.textColor,
                        catConfig.borderColor
                      )}
                    >
                      {rtl ? catConfig.labelAr : catConfig.label}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Name & Price */}
                  <div>
                    <h3
                      className={cn(
                        "font-semibold text-sm leading-tight line-clamp-1",
                        rtl && "font-arabic text-right"
                      )}
                    >
                      {rtl ? product.nameAr : product.nameEn}
                    </h3>
                    <div
                      className={cn(
                        "flex items-center gap-1 mt-1",
                        rtl && "flex-row-reverse"
                      )}
                    >
                      <DollarSign className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-sm font-bold text-primary tabular-nums">
                        {product.price}
                      </span>
                      <span
                        className={cn(
                          "text-xs text-muted-foreground",
                          rtl && "font-arabic"
                        )}
                      >
                        {rtl ? "ر.س" : "SAR"}
                      </span>
                    </div>
                  </div>

                  {/* Description Snippet */}
                  <p
                    className={cn(
                      "text-xs text-muted-foreground line-clamp-2 leading-relaxed",
                      rtl && "font-arabic text-right"
                    )}
                  >
                    {rtl ? product.descriptionAr : product.descriptionEn}
                  </p>

                  {/* Actions */}
                  <div
                    className={cn(
                      "flex items-center gap-2 pt-1",
                      rtl && "flex-row-reverse"
                    )}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(product)}
                      className={cn(
                        "gap-1.5 text-xs h-8 flex-1",
                        rtl && "font-arabic flex-row-reverse"
                      )}
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
                        rtl && "font-arabic flex-row-reverse"
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
          <DialogHeader className={cn(rtl && "text-right items-end")}>
            <DialogTitle className={rtl && "font-arabic text-right"}>
              {editingProduct
                ? t(locale, "catalog.editProduct")
                : t(locale, "catalog.addProduct")}
            </DialogTitle>
            <DialogDescription className={rtl && "font-arabic text-right"}>
              {editingProduct
                ? rtl
                  ? "قم بتعديل تفاصيل المنتج"
                  : "Update product details"
                : rtl
                  ? "أضف منتج أو خدمة جديدة إلى الكتالوج"
                  : "Add a new product or service to the catalog"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            {/* English Name */}
            <div className="space-y-2">
              <Label
                className={cn(rtl && "font-arabic text-right block")}
                htmlFor="nameEn"
              >
                {t(locale, "catalog.productName")}
              </Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nameEn: e.target.value }))
                }
                placeholder={
                  rtl ? "اسم المنتج بالإنجليزية" : "Product name in English"
                }
                className={rtl ? "text-left font-sans" : ""}
              />
            </div>

            {/* Arabic Name */}
            <div className="space-y-2">
              <Label
                className={cn("font-arabic text-right block")}
                htmlFor="nameAr"
              >
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
              <Label
                className={cn(rtl && "font-arabic text-right block")}
                htmlFor="descEn"
              >
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
                placeholder={
                  rtl ? "الوصف بالإنجليزية" : "Description in English"
                }
                rows={3}
                className={rtl ? "text-left font-sans" : ""}
              />
            </div>

            {/* Arabic Description */}
            <div className="space-y-2">
              <Label
                className={cn("font-arabic text-right block")}
                htmlFor="descAr"
              >
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
                <Label
                  className={cn(rtl && "font-arabic text-right block")}
                  htmlFor="price"
                >
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
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label
                  className={cn(rtl && "font-arabic text-right block")}
                >
                  {t(locale, "catalog.productCategory")}
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: val as Category,
                    }))
                  }
                >
                  <SelectTrigger className={cn("w-full", rtl && "font-arabic")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(categoryConfig) as Category[]).map((cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className={rtl ? "font-arabic" : ""}
                      >
                        {rtl
                          ? categoryConfig[cat].labelAr
                          : categoryConfig[cat].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label
                className={cn(rtl && "font-arabic text-right block")}
                htmlFor="imageUrl"
              >
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
                className={rtl ? "font-arabic text-right" : ""}
              />
            </div>

            {/* Availability Toggle */}
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border p-3",
                "bg-muted/30",
                rtl && "flex-row-reverse"
              )}
            >
              <Label
                className={cn(
                  "cursor-pointer",
                  rtl && "font-arabic text-right"
                )}
                htmlFor="availability"
              >
                {t(locale, "catalog.availability")}
              </Label>
              <div className={cn("flex items-center gap-2", rtl && "flex-row-reverse")}>
                <span
                  className={cn(
                    "text-xs",
                    formData.available
                      ? "text-sage-600 dark:text-sage-400"
                      : "text-red-500 dark:text-red-400",
                    rtl && "font-arabic"
                  )}
                >
                  {formData.available
                    ? t(locale, "available")
                    : t(locale, "unavailable")}
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

          <DialogFooter
            className={cn(rtl && "flex-row-reverse sm:flex-row-reverse")}
          >
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

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir={rtl ? "rtl" : "ltr"}>
          <AlertDialogHeader
            className={cn(rtl && "text-right items-end")}
          >
            <AlertDialogTitle
              className={cn(rtl && "font-arabic text-right")}
            >
              {t(locale, "catalog.deleteProduct")}
            </AlertDialogTitle>
            <AlertDialogDescription
              className={cn(rtl && "font-arabic text-right")}
            >
              {t(locale, "catalog.deleteConfirm")}
              {deletingProduct && (
                <span className="font-semibold block mt-1">
                  &quot;{rtl ? deletingProduct.nameAr : deletingProduct.nameEn}
                  &quot;
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter
            className={cn(rtl && "flex-row-reverse sm:flex-row-reverse")}
          >
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
    </div>
  );
}
