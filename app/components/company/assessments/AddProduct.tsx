"use client";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Trash2, Plus, Info } from "lucide-react";
import { useFormattedNumber } from "@/hooks/useNumberFormater";

export interface ProductData {
  id: string;
  productType: string;
  weight: string;
  unit: string;
}

interface AddProductProps {
  products: ProductData[];
  onProductsChange: (products: ProductData[]) => void;
  error?: string;
}

const productTypeOptions = [
  { value: "plastics", label: "Plastics" },
  { value: "metals", label: "Metals" },
  { value: "glass", label: "Glass" },
  { value: "paper-cardboard", label: "Paper & Cardboard" },
  { value: "textiles", label: "Textiles" },
  { value: "electronics", label: "Electronics / E-Waste" },
  { value: "organic", label: "Organic Materials" },
  { value: "others", label: "Others" },
];

const unitOptions = [{ value: "tonnes", label: "Tonnes" }];

function ProductRow({
  product,
  updateProduct,
  removeProduct,
  validateProduct,
  errors,
}: {
  product: ProductData;
  updateProduct: (id: string, field: keyof Omit<ProductData, "id">, value: string) => void;
  removeProduct: (id: string) => void;
  validateProduct: (product: ProductData) => void;
  errors: { [key: string]: string };
}) {
  const formatted = useFormattedNumber(product.weight);

  return (
    <Card className="p-4 relative">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor={`product-type-${product.id}`} className="flex items-center gap-1">
              Product Type
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the type of product sold that</p>
                    <p>requires end-of-life treatment reporting</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select
              value={product.productType}
              onValueChange={(value) => updateProduct(product.id, "productType", value)}
            >
              <SelectTrigger id={`product-type-${product.id}`}>
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                {productTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor={`weight-${product.id}`} className="flex items-center gap-1">
              Weight/Quantity Sold
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Weight/Quantity Input Guide</p>
                    <p className="text-xs">Enter the total weight or quantity of products sold.</p>
                    <p className="text-xs mt-1">• You can enter 0 if no products were sold</p>
                    <p className="text-xs">• Negative values are not allowed</p>
                    <p className="text-xs">
                      • Use decimals for precise measurements (e.g., 1250.5)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id={`weight-${product.id}`}
              type="text"
              placeholder="Enter total weight or quantity"
              value={formatted.displayValue}
              onChange={(e) => {
                formatted.handleChange(e.target.value);
                updateProduct(product.id, "weight", formatted.rawValue);
              }}
              onBlur={() => validateProduct(product)}
              className={errors[`${product.id}-weight`] ? "border-destructive" : ""}
            />
            {errors[`${product.id}-weight`] && (
              <p className="text-sm text-destructive mt-1">{errors[`${product.id}-weight`]}</p>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor={`unit-${product.id}`}>Unit</Label>
            <Select
              value={product.unit}
              onValueChange={(value) => updateProduct(product.id, "unit", value)}
            >
              <SelectTrigger id={`unit-${product.id}`}>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeProduct(product.id)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label="Remove product"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AddProduct({ products, onProductsChange, error }: AddProductProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const addProduct = () => {
    const newProduct: ProductData = {
      id: Date.now().toString(),
      productType: productTypeOptions[0].value,
      weight: "",
      unit: unitOptions[0].value,
    };
    onProductsChange([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    onProductsChange(products.filter((product) => product.id !== id));
    const newErrors = { ...errors };
    delete newErrors[`${id}-weight`];
    setErrors(newErrors);
  };

  const updateProduct = (id: string, field: keyof Omit<ProductData, "id">, value: string) => {
    onProductsChange(
      products.map((product) => {
        if (product.id === id) {
          return { ...product, [field]: value };
        }
        return product;
      })
    );

    if (field === "weight" && errors[`${id}-weight`]) {
      const newErrors = { ...errors };
      delete newErrors[`${id}-weight`];
      setErrors(newErrors);
    }
  };

  const validateProduct = (product: ProductData) => {
    const newErrors = { ...errors };
    // FIX: Accept 0 and any valid number >= 0
    if (!product.weight || isNaN(Number(product.weight)) || Number(product.weight) < 0) {
      newErrors[`${product.id}-weight`] = "Please enter a valid number (0 or greater)";
    }
    setErrors(newErrors);
  };

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-4">
        {products.length === 0 ? (
          <p className="text-muted-foreground text-center">
            No products added yet. Click &quot;Add Product&quot; to begin.
          </p>
        ) : (
          products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              updateProduct={updateProduct}
              removeProduct={removeProduct}
              validateProduct={validateProduct}
              errors={errors}
            />
          ))
        )}
      </div>

      <div className="flex justify-center">
        <Button type="button" variant="outline" onClick={addProduct} className="w-full border">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
    </div>
  );
}
