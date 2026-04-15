'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight, 
  Calendar,
  Mail,
  Phone,
  Trash2,
  ExternalLink,
  Download,
  Users,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgencyClients } from '@/hooks/use-agency-clients';
import { useAgencyStore } from '@/context/agency-store';
import { ClientUploadDialog } from './client-upload-dialog';
import { DrawCalendar } from './draw-calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    PIPELINE_STATUSES, 
    STATUS_CONFIG, 
    PipelineStatus 
} from './client-detail-view';

export function ClientList() {
  const { clients, isLoading, deleteClient, updateClient, refresh } = useAgencyClients();
  const { addTab } = useAgencyStore();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'clients' | 'draws'>('clients');

  const filteredClients = clients.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.urn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (client: any) => {
    addTab({
      id: client.id,
      type: 'detail',
      title: client.full_name || client.urn,
      data: client
    });
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header Section - Condensed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            {activeView === 'clients' ? 'Clients Management' : 'IRCC Draw Calendar'}
          </h1>
          <p className="text-[11px] text-gray-500">
            {activeView === 'clients' ? 'Manage and track your client cases for Canadian job search.' : 'Express Entry draw history with real-time client eligibility matching.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveView('clients')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wide transition-all",
                activeView === 'clients' ? "bg-white text-brand-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Users className="w-3.5 h-3.5" />
              Clients
            </button>
            <button
              onClick={() => setActiveView('draws')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wide transition-all",
                activeView === 'draws' ? "bg-white text-brand-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              Draws
            </button>
          </div>
          {activeView === 'clients' && (
            <Button 
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm rounded-lg h-9 px-4 text-xs font-bold transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add New Clients
            </Button>
          )}
        </div>
      </div>

      {/* Draw Calendar View */}
      {activeView === 'draws' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <DrawCalendar />
        </motion.div>
      )}

      {/* Client Table View */}
      {activeView === 'clients' && (
        <>
          {/* Filter & Search Bar - Compact */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input 
                placeholder="Search by name, URN, or email..." 
                className="pl-9 h-9 border-gray-100 bg-gray-50/50 rounded-lg focus:bg-white transition-all text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="h-9 border-gray-100 rounded-lg px-3 flex-1 sm:flex-none text-xs font-bold text-gray-600">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                Filter
              </Button>
              <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100">
                {filteredClients.length} Clients
              </div>
            </div>
          </div>

          {/* Clients Table - High Density */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center space-y-3">
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                   className="inline-block w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full"
                 />
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Clients...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">No clients found</h3>
                <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                  Start by uploading resumes to automatically generate client cases.
                </p>
                <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2 border-brand-200 text-brand-600 hover:bg-brand-50 text-[10px] font-bold uppercase"
                    onClick={() => setIsUploadOpen(true)}
                >
                    Upload First Resume
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/30">
                  <TableRow className="hover:bg-transparent border-gray-100 h-10">
                    <TableHead className="w-[110px] font-bold text-gray-500 text-[10px] uppercase tracking-wider">URN</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[10px] uppercase tracking-wider">Name</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[10px] uppercase tracking-wider">Contact</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[10px] uppercase tracking-wider">Position</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[10px] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[10px] uppercase tracking-wider text-center">Engagement</TableHead>
                    <TableHead className="font-bold text-gray-500 text-[10px] uppercase tracking-wider">Date Added</TableHead>
                    <TableHead className="w-[60px] text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow 
                      key={client.id} 
                      className="group cursor-pointer hover:bg-brand-50/30 border-gray-50 transition-colors h-14"
                      onClick={() => handleRowClick(client)}
                    >
                      <TableCell>
                        <code className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                          {client.urn}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-brand-600/10 rounded-lg flex items-center justify-center text-brand-700 font-bold uppercase text-xs">
                            {client.full_name?.[0] || '?'}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                              {client.full_name || 'Unnamed'}
                            </p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Client Overview</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600">
                            <Mail className="w-3 h-3 text-gray-300" />
                            {client.email || 'N/A'}
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-0.5">
                           <span className="text-[11px] font-bold text-gray-700 truncate max-w-[140px]">
                            {client.extracted_data?.position || 'N/A'}
                           </span>
                           <span className="text-[9px] font-bold text-gray-400 uppercase truncate max-w-[140px]">
                            {client.extracted_data?.company || ''}
                           </span>
                        </div>
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <Select 
                            value={client.status || 'pre-screening'} 
                            onValueChange={(val) => updateClient({ id: client.id, updates: { status: val } })}
                        >
                            <SelectTrigger className={cn(
                                "h-6 min-w-[120px] text-[9px] font-black uppercase tracking-widest rounded border px-2 transition-all shadow-none focus:ring-0",
                                STATUS_CONFIG[client.status as PipelineStatus]?.bg || 'bg-gray-50',
                                STATUS_CONFIG[client.status as PipelineStatus]?.color || 'text-gray-600',
                                STATUS_CONFIG[client.status as PipelineStatus]?.border || 'border-gray-200'
                            )}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                {PIPELINE_STATUSES.map(status => (
                                    <SelectItem key={status} value={status} className="text-[10px] font-bold uppercase tracking-tight py-2 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CONFIG[status as PipelineStatus].dot)} />
                                            {STATUS_CONFIG[status as PipelineStatus].label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-full border border-gray-100">
                                 <div className={cn(
                                     "w-1.5 h-1.5 rounded-full",
                                     (client.engagement_stats?.views || 0) > 0 ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                                 )} />
                                 <span className="text-[10px] font-black text-gray-600">{(client.engagement_stats?.views || 0)} Views</span>
                            </div>
                            {client.engagement_stats?.views > 0 && (
                                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-tighter">Active Lead</span>
                            )}
                        </div>
                       </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(client.created_at), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-7 w-7 p-0 rounded-lg hover:bg-gray-100 transition-all">
                                        <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[160px] rounded-lg border-gray-100 shadow-xl p-1">
                                    <DropdownMenuItem onClick={() => handleRowClick(client)} className="rounded-md py-1.5 cursor-pointer gap-2 focus:bg-brand-50 focus:text-brand-600 font-bold text-[11px]">
                                        <ExternalLink className="w-3.5 h-3.5" /> View Details
                                    </DropdownMenuItem>
                                    {client.resume_url && (
                                        <DropdownMenuItem asChild className="rounded-md py-1.5 cursor-pointer gap-2 focus:bg-brand-50 focus:text-brand-600 font-bold text-[11px]">
                                            <a href={client.resume_url} target="_blank" rel="noopener noreferrer">
                                                <Download className="w-3.5 h-3.5" /> Resume
                                            </a>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator className="my-1 bg-gray-50" />
                                    <DropdownMenuItem 
                                        onClick={() => deleteClient(client.id)}
                                        className="rounded-md py-1.5 cursor-pointer gap-2 focus:bg-red-50 focus:text-red-600 font-bold text-[11px] text-red-500"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete Case
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-brand-400 transition-colors" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}

      <ClientUploadDialog 
         open={isUploadOpen} 
         onOpenChange={setIsUploadOpen} 
         onUploadSuccess={refresh}
      />
    </div>
  );
}
