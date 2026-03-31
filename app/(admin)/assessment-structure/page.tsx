"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MoreVertical, LayoutGrid, List } from "lucide-react";
import Header from "@/app/components/layout/Header";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { adminDisclosureService } from "@/services/adminDisclosure.service";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { toast } from "react-toastify";
import { AuditLogModal } from "./components/AuditLogModal";
import { Edit3, Trash2, History } from "lucide-react";

interface Sector {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
}

export default function AssessmentStructurePage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [newSector, setNewSector] = useState({ name: "", code: "", description: "" });
  
  // Audit Log State
  const [auditState, setAuditState] = useState<{
    isOpen: boolean;
    entityId?: number;
    title?: string;
  }>({ isOpen: false });

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const data = await adminDisclosureService.getSectors();
      setSectors(data);
    } catch (error) {
      console.error("Failed to fetch sectors:", error);
      toast.error("Failed to load sectors");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSector = async () => {
    if (!newSector.name) {
      toast.error("Sector name is required");
      return;
    }
    try {
      if (editingSector) {
        await adminDisclosureService.updateSector(editingSector.id, newSector);
        toast.success("Sector updated successfully");
      } else {
        await adminDisclosureService.createSector(newSector);
        toast.success("Sector created successfully");
      }
      setIsCreateDialogOpen(false);
      setEditingSector(null);
      setNewSector({ name: "", code: "", description: "" });
      fetchSectors();
    } catch (error) {
      console.error("Failed to save sector:", error);
      toast.error("Failed to save sector");
    }
  };

  const handleDeleteSector = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this sector? This will delete all industries and data within it.")) return;
    try {
      await adminDisclosureService.deleteSector(id);
      toast.success("Sector deleted");
      fetchSectors();
    } catch (error) {
      toast.error("Failed to delete sector");
    }
  };

  const openAuditLog = (e: React.MouseEvent, sector: Sector) => {
    e.preventDefault();
    e.stopPropagation();
    setAuditState({ isOpen: true, entityId: sector.id, title: sector.name });
  };

  const openEdit = (e: React.MouseEvent, sector: Sector) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSector(sector);
    setNewSector({ 
      name: sector.name, 
      code: sector.code || "", 
      description: sector.description || "" 
    });
    setIsCreateDialogOpen(true);
  };

  const filteredSectors = sectors.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="min-h-screen flex flex-col">
      <motion.main
        className="flex-1 p-4 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.5 }}
      >
        <Header />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Assessment Hierarchy</h2>
            <p className="text-muted-foreground">
              Manage the 7-level structure (Sector ➔ Industry ➔ Pillar ➔ Topic ➔ Subtopic ➔ Metric ➔ Detail)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Sector
            </Button>

            <Dialog 
              open={isCreateDialogOpen} 
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) {
                  setEditingSector(null);
                  setNewSector({ name: "", code: "", description: "" });
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSector ? 'Edit Sector' : 'Create New Sector'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    {editingSector ? 'Modify sector details.' : 'Add a new top-level classification for industries.'}
                  </p>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Technology"
                        value={newSector.name}
                        onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="code">Short Code (Optional)</Label>
                      <Input
                        id="code"
                        placeholder="e.g. TECH"
                        value={newSector.code}
                        onChange={(e) => setNewSector({ ...newSector, code: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Brief overview..."
                        value={newSector.description}
                        onChange={(e) => setNewSector({ ...newSector, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-emerald-600" onClick={handleCreateSector}>
                      {editingSector ? 'Save Changes' : 'Create Sector'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sectors..."
              className="pl-8 bg-white border-neutral-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse bg-neutral-50 h-40" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              layout
            >
              {filteredSectors.map((sector) => (
                <Link key={sector.id} href={`/assessment-structure/${sector.id}`}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="cursor-pointer border-neutral-200 hover:border-emerald-300 hover:shadow-lg transition-all h-full group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl font-bold group-hover:text-emerald-700 transition-colors">
                              {sector.name}
                            </CardTitle>
                            {sector.code && (
                              <span className="mt-1 inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded uppercase tracking-wider">
                                {sector.code}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-400 hover:text-emerald-600" onClick={(e) => openAuditLog(e, sector)} title="History">
                              <History className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-400 hover:text-blue-600" onClick={(e) => openEdit(e, sector)} title="Edit">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-400 hover:text-red-500" onClick={(e) => handleDeleteSector(e, sector.id)} title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2 mt-2">
                          {sector.description || "No description provided."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="mt-4 flex items-center text-xs font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                          Manage Industries & Hierarchy →
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        <AuditLogModal 
          isOpen={auditState.isOpen} 
          onClose={() => setAuditState({ ...auditState, isOpen: false })} 
          entityType="Sector" 
          entityId={auditState.entityId} 
          title={auditState.title} 
        />

        {!loading && filteredSectors.length === 0 && (
          <div className="text-center py-20 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
            <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No sectors found</h3>
            <p className="text-muted-foreground">Try adjusting your search or create a new sector.</p>
            <Button
              className="mt-6 bg-emerald-600"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Sector
            </Button>
          </div>
        )}
      </motion.main>
    </section>
  );
}
