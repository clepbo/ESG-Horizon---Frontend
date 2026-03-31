"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, ChevronLeft, Building2, ListTree, Edit3, Trash2, History } from "lucide-react";
import Header from "@/app/components/layout/Header";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { adminDisclosureService } from "@/services/adminDisclosure.service";
import Link from "next/link";
import { toast } from "react-toastify";
import { CustomBreadcrumb } from "@/app/components/ui/CustomBreadcrumb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { AuditLogModal } from "../components/AuditLogModal";

interface Sector {
  id: number;
  name: string;
  code: string | null;
}

interface Industry {
  id: number;
  name: string;
  description: string | null;
}

export default function SectorIndustriesPage() {
  const params = useParams();
  const sectorId = params?.sectorId as string;
  const [sector, setSector] = useState<Sector | null>(null);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [newIndustry, setNewIndustry] = useState({ name: "", description: "" });

  // Audit Log State
  const [auditState, setAuditState] = useState<{
    isOpen: boolean;
    entityId?: number;
    title?: string;
  }>({ isOpen: false });

  useEffect(() => {
    if (sectorId) {
      fetchData();
    }
  }, [sectorId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectorData, industriesData] = await Promise.all([
        adminDisclosureService.getSector(+sectorId),
        adminDisclosureService.getIndustriesBySector(+sectorId),
      ]);
      setSector(sectorData);
      setIndustries(industriesData);
    } catch (error) {
      console.error("Failed to fetch sector industries:", error);
      toast.error("Failed to load industries");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIndustry = async () => {
    if (!newIndustry.name) {
      toast.error("Industry name is required");
      return;
    }
    try {
      if (editingIndustry) {
        await adminDisclosureService.updateIndustry(editingIndustry.id, newIndustry);
        toast.success("Industry updated");
      } else {
        await adminDisclosureService.createIndustry({ ...newIndustry, sectorId: +sectorId });
        toast.success("Industry created");
      }
      setIsDialogOpen(false);
      setEditingIndustry(null);
      setNewIndustry({ name: "", description: "" });
      fetchData();
    } catch (error) {
      toast.error("Failed to save industry");
    }
  };

  const handleDeleteIndustry = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure? This will delete all hierarchy data for this industry.")) return;
    try {
      await adminDisclosureService.deleteIndustry(id);
      toast.success("Industry deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete industry");
    }
  };

  const openAuditLog = (e: React.MouseEvent, industry: Industry) => {
    e.preventDefault();
    e.stopPropagation();
    setAuditState({ isOpen: true, entityId: industry.id, title: industry.name });
  };

  const openEdit = (e: React.MouseEvent, industry: Industry) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingIndustry(industry);
    setNewIndustry({ name: industry.name, description: industry.description || "" });
    setIsDialogOpen(true);
  };

  const filteredIndustries = industries.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const breadcrumbItems = [
    { label: "Assessment Hierarchy", href: "/assessment-structure" },
    { label: sector?.name || "Sector", active: true },
  ];

  return (
    <section className="min-h-screen flex flex-col">
      <motion.main
        className="flex-1 p-4 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.5 }}
      >
        <Header />

        <div className="space-y-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/assessment-structure">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">
                  {loading ? "Loading..." : sector?.name}
                </h2>
              </div>
              <p className="text-muted-foreground ml-10">
                Manage industries and their specific disclosure hierarchies for this sector
              </p>
            </div>

            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Industry
            </Button>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingIndustry(null);
                  setNewIndustry({ name: "", description: "" });
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingIndustry ? "Edit Industry" : "Add Industry"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="industry-name">Name</Label>
                      <Input
                        id="industry-name"
                        placeholder="e.g. Software Development"
                        value={newIndustry.name}
                        onChange={(e) => setNewIndustry({ ...newIndustry, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="industry-desc">Description</Label>
                      <Input
                        id="industry-description"
                        placeholder="Brief overview..."
                        value={newIndustry.description}
                        onChange={(e) => setNewIndustry({ ...newIndustry, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-emerald-600" onClick={handleSaveIndustry}>
                      {editingIndustry ? "Save Changes" : "Create Industry"}
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
              placeholder="Search industries..."
              className="pl-8 bg-white border-neutral-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse bg-neutral-50 h-32" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
            >
              {filteredIndustries.map((industry) => (
                <Link key={industry.id} href={`/assessment-structure/${sectorId}/${industry.id}`}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="cursor-pointer border-neutral-200 hover:border-emerald-300 hover:shadow-md transition-all group overflow-hidden">
                      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 text-left">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg font-bold group-hover:text-emerald-700 transition-colors">
                            {industry.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-1">
                            {industry.description || "Sector-specific industry"}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                           <Button size="icon" variant="ghost" className="h-7 w-7 text-neutral-400 hover:text-emerald-600" onClick={(e) => openAuditLog(e, industry)} title="History">
                             <History className="h-3.5 w-3.5" />
                           </Button>
                           <Button size="icon" variant="ghost" className="h-7 w-7 text-neutral-400 hover:text-blue-600" onClick={(e) => openEdit(e, industry)} title="Edit">
                             <Edit3 className="h-3.5 w-3.5" />
                           </Button>
                           <Button size="icon" variant="ghost" className="h-7 w-7 text-neutral-400 hover:text-red-500" onClick={(e) => handleDeleteIndustry(e, industry.id)} title="Delete">
                             <Trash2 className="h-3.5 w-3.5" />
                           </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                             <ListTree className="h-3 w-3" />
                             7-Level Hierarchy Active
                          </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                          Configure Hierarchy Builder →
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
          entityType="Industry" 
          entityId={auditState.entityId} 
          title={auditState.title} 
        />

        {!loading && filteredIndustries.length === 0 && (
          <div className="text-center py-20 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No industries found</h3>
            <p className="text-muted-foreground">This sector currently has no industries assigned.</p>
            <Button className="mt-6 bg-emerald-600" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Industry
            </Button>
          </div>
        )}
      </motion.main>
    </section>
  );
}
