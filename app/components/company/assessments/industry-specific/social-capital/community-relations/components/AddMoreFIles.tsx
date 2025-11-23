"use client";


import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";

interface EvidenceItemProps {
  index: number;
  onRemove: () => void;
}

export function EvidenceItem({ index, onRemove }: EvidenceItemProps) {

    const [items, setItems] = useState([0]);


  function addItem() {
    setItems(prev => [...prev, prev.length]);
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index));
  }
  
  return (
    <Card className="w-full bg-white shadow-sm border rounded-xl">
      <CardContent className="p-6 space-y-6">
        {/* Row 1: Name + Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Name of file/evidence</Label>
            <Input placeholder="Enter the file/evidence name" />
          </div>

          <div className="space-y-1">
            <Label>Upload File</Label>
            <div className="flex items-center gap-3">
              <Input type="file" className="flex-1" />
              <Button variant="destructive" size="icon" onClick={onRemove}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Upload via Link */}
        <div className="space-y-1">
          <div className="space-y-6">
      {items.map((item, index) => (
        <EvidenceItem
          key={index}
          index={index}
          onRemove={() => removeItem(index)}
        />
      ))}

      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={addItem}
      >
        <Plus className="h-4 w-4" />
        Add More Files/Links
      </Button>
    </div>
        </div>
      </CardContent>
    </Card>
  );
}
