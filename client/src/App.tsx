import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Users, TrendingUp, Search, Filter, Building2, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { ProspectForm } from '@/components/ProspectForm';
import { ProspectDetail } from '@/components/ProspectDetail';

// Using type-only import for better TypeScript compliance
import type { Prospect, CreateProspectInput, ProspectFilter, ProspectStatus, ProspectPriority } from '../../server/src/schema';

function App() {
  // State management with proper typing
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ProspectPriority | 'all'>('all');

  // Load prospects with filters
  const loadProspects = useCallback(async () => {
    try {
      const filters: ProspectFilter = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'all') filters.status = statusFilter as ProspectStatus;
      if (priorityFilter !== 'all') filters.priority = priorityFilter as ProspectPriority;

      const result = await trpc.getProspects.query(filters);
      setProspects(result);
    } catch (error) {
      console.error('Failed to load prospects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, priorityFilter]);

  // Load prospects on mount and filter changes
  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  const handleCreateProspect = async (formData: CreateProspectInput) => {
    try {
      const response = await trpc.createProspect.mutate(formData);
      setProspects((prev: Prospect[]) => [response, ...prev]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create prospect:', error);
    }
  };

  const handleUpdateProspect = async (updatedProspect: Prospect) => {
    setProspects((prev: Prospect[]) => 
      prev.map((p: Prospect) => p.id === updatedProspect.id ? updatedProspect : p)
    );
    setSelectedProspect(updatedProspect);
  };

  const handleDeleteProspect = async (id: number) => {
    try {
      await trpc.deleteProspect.mutate({ id });
      setProspects((prev: Prospect[]) => prev.filter((p: Prospect) => p.id !== id));
      setSelectedProspect(null);
    } catch (error) {
      console.error('Failed to delete prospect:', error);
    }
  };

  // Status badge styling
  const getStatusBadgeVariant = (status: ProspectStatus) => {
    switch (status) {
      case 'new': return 'secondary';
      case 'contacted': return 'outline';
      case 'qualified': return 'default';
      case 'proposal': return 'secondary';
      case 'negotiation': return 'default';
      case 'closed_won': return 'default';
      case 'closed_lost': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeColor = (priority: ProspectPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: ProspectStatus) => {
    const labels = {
      'new': 'Baru',
      'contacted': 'Dihubungi',
      'qualified': 'Terkualifikasi',
      'proposal': 'Proposal',
      'negotiation': 'Negosiasi',
      'closed_won': 'Menang',
      'closed_lost': 'Kalah'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: ProspectPriority) => {
    const labels = {
      'urgent': 'Mendesak',
      'high': 'Tinggi',
      'medium': 'Sedang',
      'low': 'Rendah'
    };
    return labels[priority] || priority;
  };

  // Calculate stats
  const stats = {
    total: prospects.length,
    qualified: prospects.filter(p => p.status === 'qualified' || p.status === 'proposal' || p.status === 'negotiation').length,
    highPriority: prospects.filter(p => p.priority === 'high' || p.priority === 'urgent').length,
    closedWon: prospects.filter(p => p.status === 'closed_won').length,
    totalValue: prospects.filter(p => p.estimated_value).reduce((sum, p) => sum + (p.estimated_value || 0), 0)
  };

  if (selectedProspect) {
    return (
      <ProspectDetail
        prospect={selectedProspect}
        onBack={() => setSelectedProspect(null)}
        onUpdate={handleUpdateProspect}
        onDelete={() => handleDeleteProspect(selectedProspect.id)}
      />
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowForm(false)}
                size="sm"
              >
                ← Kembali
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Tambah Prospek Baru</h1>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Informasi Prospek
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProspectForm 
                  onSubmit={handleCreateProspect}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                CRM Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Kelola prospek dan pipeline penjualan</p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Prospek
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Prospek</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Qualified</p>
                  <p className="text-2xl font-bold text-green-600">{stats.qualified}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prioritas Tinggi</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.highPriority}</p>
                </div>
                <Filter className="h-8 w-8 text-orange-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Deal Menang</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.closedWon}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${stats.totalValue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari nama, email, atau perusahaan..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as ProspectStatus | 'all')}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="new">Baru</SelectItem>
                  <SelectItem value="contacted">Dihubungi</SelectItem>
                  <SelectItem value="qualified">Terkualifikasi</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negosiasi</SelectItem>
                  <SelectItem value="closed_won">Menang</SelectItem>
                  <SelectItem value="closed_lost">Kalah</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(value: string) => setPriorityFilter(value as ProspectPriority | 'all')}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter Prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Prioritas</SelectItem>
                  <SelectItem value="urgent">Mendesak</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="low">Rendah</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Prospects List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat prospek...</p>
            </CardContent>
          </Card>
        ) : prospects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                  ? 'Tidak ada prospek yang sesuai filter' 
                  : 'Belum ada prospek'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Mulai dengan menambahkan prospek pertama Anda'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Prospek Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {prospects.map((prospect: Prospect) => (
              <Card 
                key={prospect.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedProspect(prospect)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                        {prospect.first_name.charAt(0)}{prospect.last_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {prospect.first_name} {prospect.last_name}
                          </h3>
                          <Badge variant={getStatusBadgeVariant(prospect.status)} className="text-xs">
                            {getStatusLabel(prospect.status)}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityBadgeColor(prospect.priority)}`}>
                            {getPriorityLabel(prospect.priority)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{prospect.email}</span>
                          </div>
                          {prospect.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{prospect.phone}</span>
                            </div>
                          )}
                          {prospect.company && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <span className="truncate">{prospect.company}</span>
                            </div>
                          )}
                          {prospect.estimated_value && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>${prospect.estimated_value.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {prospect.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 line-clamp-2">{prospect.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{prospect.created_at.toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;