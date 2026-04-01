"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Plus, 
  Settings2, 
  Trash2, 
  Edit3, 
  Layers, 
  Box,
  Layout,
  Database,
  History
} from "lucide-react";
import Header from "@/app/components/layout/Header";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { adminDisclosureService } from "@/services/adminDisclosure.service";
import Link from "next/link";
import { toast } from "react-toastify";
import { CustomBreadcrumb } from "@/app/components/ui/CustomBreadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";

import { 
  TopicModal,
  SubtopicModal,
  MetricModal, 
  SubmetricModal, 
  DetailModal,
  PillarModal
} from "../../components/HierarchyModals";
import { AuditLogModal } from "../../components/AuditLogModal";

// ── Types ────────────────────────────────────────────────────────────────────

interface SubmetricDetail {
  id: number;
  label: string;
  type: string;
  isRequired: boolean;
  sortOrder: number;
}

interface Submetric {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  submetricDetails: SubmetricDetail[];
}

interface Metric {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  submetrics: Submetric[];
}

interface Subtopic {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  metrics: Metric[];
}

interface Topic {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  subtopics: Subtopic[];
}

interface Pillar {
  id: number;
  name: string;
  topics: Topic[];
}

interface IndustryData {
  id: number;
  name: string;
  sectorId: number;
  pillars: {
    pillar: Pillar;
  }[];
}

// ── Main Page Component ──────────────────────────────────────────────────────

export default function HierarchyBuilderPage() {
  const params = useParams();
  const sectorId = params.sectorId as string;
  const industryId = params.industryId as string;
  
  const [industry, setIndustry] = useState<IndustryData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalState, setModalState] = useState<{
    type: 'pillar' | 'topic' | 'subtopic' | 'metric' | 'submetric' | 'detail' | null;
    isOpen: boolean;
    parentId?: number;
    initialData?: any;
  }>({ type: null, isOpen: false });

  // Audit Log State
  const [auditState, setAuditState] = useState<{
    isOpen: boolean;
    entityType?: string;
    entityId?: number;
    title?: string;
  }>({ isOpen: false });

  const fetchHierarchy = useCallback(async () => {
    if (!industryId) return;
    try {
      setLoading(true);
      const data = await adminDisclosureService.getIndustryHierarchy(+industryId);
      setIndustry(data);
    } catch (error) {
      console.error("Failed to fetch hierarchy:", error);
      toast.error("Failed to load assessment hierarchy");
    } finally {
      setLoading(false);
    }
  }, [industryId]);

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  const openModal = (type: 'pillar' | 'topic' | 'subtopic' | 'metric' | 'submetric' | 'detail', parentId?: number, initialData?: any) => {
    setModalState({ type, isOpen: true, parentId, initialData });
  };

  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  const handleDelete = async (type: string, id: number) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
    try {
      switch (type) {
        case 'pillar': await adminDisclosureService.deletePillar(id); break;
        case 'topic': await adminDisclosureService.deleteTopic(id); break;
        case 'subtopic': await adminDisclosureService.deleteSubtopic(id); break;
        case 'metric': await adminDisclosureService.deleteMetric(id); break;
        case 'submetric': await adminDisclosureService.deleteSubmetric(id); break;
        case 'detail': await adminDisclosureService.deleteSubmetricDetail(id); break;
      }
      toast.success(`${type} deleted`);
      fetchHierarchy();
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
    }
  };

  const openAuditLog = (type: string, id: number, name: string) => {
    setAuditState({ isOpen: true, entityType: type, entityId: id, title: name });
  };

  const breadcrumbItems = [
    { label: "Hierarchy", href: "/assessment-structure" },
    { label: "Sector", href: `/assessment-structure/${sectorId}` },
    { label: industry?.name || "Industry", active: true },
  ];

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" /></div>;
  }

  return (
    <section className="min-h-screen flex flex-col">
      <motion.main className="flex-1 p-4 space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Header />
        <div className="space-y-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <div className="flex items-center gap-3">
            <Link href={`/assessment-structure/${sectorId}`}><Button variant="ghost" size="icon"><ChevronLeft className="h-5 w-5" /></Button></Link>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Hierarchy Builder</h2>
              <p className="text-muted-foreground">{industry?.name} Assessment Tree</p>
            </div>
            <div className="ml-auto">
              <Button className="bg-emerald-600" onClick={() => openModal('pillar', +industryId)}>
                <Plus className="h-4 w-4 mr-2" /> Link New Pillar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {industry?.pillars.map(({ pillar }) => (
            <Card key={pillar.id} className="border-neutral-200 overflow-hidden">
              <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-600" /><h3 className="text-lg font-bold">{pillar.name} Pillar</h3>
                </div>
                <Button size="sm" variant="outline" className="text-emerald-700" onClick={() => openModal('topic', +industryId)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Topic
                </Button>
              </div>
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                  {pillar.topics.map((topic) => (
                    <TopicItem 
                      key={topic.id} 
                      topic={topic} 
                      onEdit={(d: any) => openModal('topic', undefined, d)} 
                      onDelete={(id: number) => handleDelete('topic', id)} 
                      onAddSubtopic={(id: number) => openModal('subtopic', id)} 
                      openModal={openModal} 
                      handleDelete={handleDelete} 
                      openAuditLog={openAuditLog}
                    />
                  ))}
                </Accordion>
                {pillar.topics.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm italic">
                    No topics defined for this pillar.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modals */}
        {modalState.type === 'pillar' && <PillarModal isOpen={modalState.isOpen} onClose={closeModal} onSuccess={fetchHierarchy} parentId={modalState.parentId} initialData={modalState.initialData} />}
        {modalState.type === 'topic' && <TopicModal isOpen={modalState.isOpen} onClose={closeModal} onSuccess={fetchHierarchy} parentId={modalState.parentId} initialData={modalState.initialData} />}
        {modalState.type === 'subtopic' && <SubtopicModal isOpen={modalState.isOpen} onClose={closeModal} onSuccess={fetchHierarchy} parentId={modalState.parentId} initialData={modalState.initialData} />}
        {modalState.type === 'metric' && <MetricModal isOpen={modalState.isOpen} onClose={closeModal} onSuccess={fetchHierarchy} parentId={modalState.parentId} initialData={modalState.initialData} />}
        {modalState.type === 'submetric' && <SubmetricModal isOpen={modalState.isOpen} onClose={closeModal} onSuccess={fetchHierarchy} parentId={modalState.parentId} initialData={modalState.initialData} />}
        {modalState.type === 'detail' && <DetailModal isOpen={modalState.isOpen} onClose={closeModal} onSuccess={fetchHierarchy} parentId={modalState.parentId} initialData={modalState.initialData} />}

        <AuditLogModal 
          isOpen={auditState.isOpen} 
          onClose={() => setAuditState({ ...auditState, isOpen: false })} 
          entityType={auditState.entityType} 
          entityId={auditState.entityId} 
          title={auditState.title} 
        />
      </motion.main>
    </section>
  );
}

// ── Sub-components for recursive rendering ──────────────────────────────────

function TopicItem({ topic, onEdit, onDelete, onAddSubtopic, openModal, handleDelete, openAuditLog }: any) {
  return (
    <AccordionItem value={`topic-${topic.id}`} className="border-b border-neutral-100 last:border-0 px-4">
      <div className="flex items-center group">
        <AccordionTrigger className="hover:no-underline py-4 flex-1">
          <div className="flex items-center gap-3 text-left">
            <Layout className="h-4 w-4 text-emerald-500" />
            <span className="font-semibold text-neutral-700">{topic.name}</span>
          </div>
        </AccordionTrigger>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
           <Button size="icon" variant="ghost" className="h-7 w-7 text-neutral-400" onClick={() => openAuditLog('Topic', topic.id, topic.name)} title="View History"><History className="h-3.5 w-3.5" /></Button>
           <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(topic)}><Edit3 className="h-3.5 w-3.5" /></Button>
           <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={() => onDelete(topic.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      <AccordionContent className="pl-6 pb-4">
        <div className="flex justify-between items-center mb-4 pr-4">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-4">
             <span>Subtopics</span>
             <span className="text-neutral-300">/</span>
             <span className="text-blue-600">Direct Metrics</span>
          </div>
          <div className="flex gap-2">
            <Button size="xs" variant="ghost" className="h-7 text-xs text-blue-600" onClick={() => openModal('metric', topic.id)}>
              <Plus className="h-3 w-3 mr-1" /> Add Direct Metric
            </Button>
            <Button size="xs" variant="ghost" className="h-7 text-xs text-emerald-600" onClick={() => onAddSubtopic(topic.id)}>
              <Plus className="h-3 w-3 mr-1" /> Add Subtopic
            </Button>
          </div>
        </div>
        <Accordion type="multiple" className="space-y-2 border-l-2 border-emerald-100 pl-4">
          {topic.metrics?.map((m: any) => (
             <MetricItem key={m.id} metric={m} openModal={openModal} handleDelete={handleDelete} openAuditLog={openAuditLog} isDirect />
          ))}
          {topic.subtopics?.map((sub: any) => (
            <SubtopicItem key={sub.id} subtopic={sub} openModal={openModal} handleDelete={handleDelete} openAuditLog={openAuditLog} />
          ))}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}

function SubtopicItem({ subtopic, openModal, handleDelete, openAuditLog }: any) {
  return (
    <AccordionItem value={`subtopic-${subtopic.id}`} className="border-0">
      <div className="flex items-center group">
        <AccordionTrigger className="hover:no-underline py-2 flex-1">
          <div className="flex items-center gap-2 text-left">
            <Box className="h-3.5 w-3.5 text-blue-500" /><span className="text-sm font-medium text-neutral-600">{subtopic.name}</span>
          </div>
        </AccordionTrigger>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
           <Button size="icon" variant="ghost" className="h-6 w-6 text-neutral-400" onClick={() => openAuditLog('Subtopic', subtopic.id, subtopic.name)} title="View History"><History className="h-3 w-3" /></Button>
           <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openModal('subtopic', undefined, subtopic)}><Edit3 className="h-3 w-3" /></Button>
           <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => handleDelete('subtopic', subtopic.id)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>
      <AccordionContent className="pl-4 pb-2">
        <div className="flex justify-between items-center mb-2 pr-4">
          <div className="text-[10px] uppercase font-bold text-muted-foreground">Metrics</div>
          <Button size="xs" variant="ghost" className="h-6 text-[10px] text-blue-600" onClick={() => openModal('metric', subtopic.id)}>
            <Plus className="h-2.5 w-2.5 mr-1" /> Add Metric
          </Button>
        </div>
        <Accordion type="multiple" className="space-y-1 border-l-2 border-blue-50 border-dotted pl-4">
          {subtopic.metrics.map((m: any) => (
            <MetricItem key={m.id} metric={m} openModal={openModal} handleDelete={handleDelete} openAuditLog={openAuditLog} />
          ))}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}

function MetricItem({ metric, openModal, handleDelete, openAuditLog, isDirect }: any) {
  return (
    <AccordionItem value={`metric-${metric.id}`} className={isDirect ? "border-b border-blue-50/50" : "border-0"}>
      <div className="flex items-center group">
        <AccordionTrigger className="hover:no-underline py-1.5 flex-1">
          <div className="flex items-center gap-2 text-left">
            <Database className={`h-3 w-3 ${isDirect ? 'text-blue-500' : 'text-orange-500'}`} />
            <span className={`text-xs font-medium ${isDirect ? 'text-blue-700' : 'text-neutral-600'}`}>
              {metric.name} {isDirect && <span className="text-[9px] bg-blue-50 px-1 rounded ml-1 text-blue-400 font-bold uppercase">Direct</span>}
            </span>
          </div>
        </AccordionTrigger>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
           <Button size="icon" variant="ghost" className="h-5 w-5 text-neutral-400" onClick={() => openAuditLog('Metric', metric.id, metric.name)} title="View History"><History className="h-2.5 w-2.5" /></Button>
           <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => openModal('metric', undefined, metric)}><Edit3 className="h-2.5 w-2.5" /></Button>
           <Button size="icon" variant="ghost" className="h-5 w-5 text-red-400" onClick={() => handleDelete('metric', metric.id)}><Trash2 className="h-2.5 w-2.5" /></Button>
        </div>
      </div>
      <AccordionContent className="pl-4 pb-1">
         <div className="space-y-1 border-l border-orange-100 pl-4 mt-2">
           {metric.submetrics.map((sub: any) => (
             <div key={sub.id} className="py-2 group/sub">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700">{sub.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-neutral-400" onClick={() => openAuditLog('Submetric', sub.id, sub.name)} title="View History"><History className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-600" onClick={() => openModal('detail', sub.id)} title="Add field"><Plus className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openModal('submetric', undefined, sub)}><Edit3 className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => handleDelete('submetric', sub.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 ml-4">
                  {sub.submetricDetails.map((det: any) => (
                    <div key={det.id} className="flex items-center justify-between p-2 rounded-md bg-neutral-50 border border-neutral-100 group/det">
                       <div className="flex flex-col"><span className="text-[10px] font-bold">{det.label}</span><span className="text-[9px] uppercase">{det.type}</span></div>
                       <div className="flex items-center gap-1 opacity-0 group-hover/det:opacity-100">
                          <Button size="icon" variant="ghost" className="h-5 w-5 text-neutral-400" onClick={() => openAuditLog('SubmetricDetail', det.id, det.label)} title="View History"><History className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => openModal('detail', undefined, det)}><Settings2 className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-5 w-5 text-red-400" onClick={() => handleDelete('detail', det.id)}><Trash2 className="h-3 w-3" /></Button>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
           ))}
           <Button size="xs" variant="ghost" className="mt-2 h-6 text-[9px] uppercase font-bold" onClick={() => openModal('submetric', metric.id)}>
             <Plus className="h-2.5 w-2.5 mr-1" /> Add Submetric
           </Button>
         </div>
      </AccordionContent>
    </AccordionItem>
  );
}
