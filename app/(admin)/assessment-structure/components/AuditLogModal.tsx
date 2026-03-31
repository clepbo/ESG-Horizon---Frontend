"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { adminDisclosureService } from "@/services/adminDisclosure.service";
import { format } from "date-fns";
import { History, User, Calendar, Activity } from "lucide-react";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Badge } from "@/app/components/ui/badge";

interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  oldValue: any;
  newValue: any;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType?: string;
  entityId?: number;
  title?: string;
}

export function AuditLogModal({ isOpen, onClose, entityType, entityId, title }: AuditLogModalProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, entityType, entityId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminDisclosureService.getAuditLogs(entityType, entityId);
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "UPDATE": return "bg-blue-50 text-blue-700 border-blue-100";
      case "DELETE": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-neutral-50 text-neutral-700";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-600" />
            Change History: {title || "Assessment Hierarchy"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] mt-4 pr-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-neutral-50 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground italic">
              No change history found for this item.
            </div>
          ) : (
            <div className="space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6 border-l-2 border-neutral-100 pb-2">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold ${getActionColor(log.action)}`}>
                          {log.action}
                        </Badge>
                        <span className="text-sm font-bold text-neutral-800">
                          {log.entityType} #{log.entityId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                      </div>
                    </div>

                    <div className="bg-neutral-50 rounded-lg p-3 text-xs border border-neutral-100">
                       <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                         <User className="h-3 w-3" />
                         <span>Modified by: <span className="font-medium text-neutral-700">{log.user.firstName} {log.user.lastName}</span> ({log.user.email})</span>
                       </div>

                       {log.action === 'UPDATE' && log.oldValue && log.newValue && (
                         <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-neutral-200">
                            <div>
                              <div className="text-[9px] uppercase font-bold text-red-500 mb-1">Before</div>
                               <pre className="text-[10px] bg-red-50 p-2 rounded overflow-x-auto">
                                 {JSON.stringify(log.oldValue, null, 2)}
                               </pre>
                            </div>
                            <div>
                               <div className="text-[9px] uppercase font-bold text-emerald-600 mb-1">After</div>
                               <pre className="text-[10px] bg-emerald-50 p-2 rounded overflow-x-auto">
                                 {JSON.stringify(log.newValue, null, 2)}
                               </pre>
                            </div>
                         </div>
                       )}

                       {log.action === 'CREATE' && (
                         <div className="mt-2 pt-2 border-t border-neutral-200">
                            <div className="text-[9px] uppercase font-bold text-emerald-600 mb-1">Initial State</div>
                            <pre className="text-[10px] bg-emerald-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.newValue, null, 2)}
                            </pre>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
