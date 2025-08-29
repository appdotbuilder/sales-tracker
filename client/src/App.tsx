import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Users, TrendingUp, Calendar, Phone, FileText } from 'lucide-react';
import { ProspectForm } from '@/components/ProspectForm';
import { ProspectDetail } from '@/components/ProspectDetail';
import './App.css';

// Using type-only import for better TypeScript compliance
import type { SalesProspect, CreateSalesProspectInput } from '../../server/src/schema';

function App() {
  // Explicit typing with SalesProspect interface
  const [prospects, setProspects] = useState<SalesProspect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<SalesProspect | null>(null);
  const [showForm, setShowForm] = useState(false);

  // useCallback to memoize function used in useEffect
  const loadProspects = useCallback(async () => {
    try {
      const result = await trpc.getSalesProspects.query();
      setProspects(result);
    } catch (error) {
      console.error('Failed to load prospects:', error);
    }
  }, []); // Empty deps since trpc is stable

  // useEffect with proper dependencies
  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  const handleCreateProspect = async (formData: CreateSalesProspectInput) => {
    setIsLoading(true);
    try {
      const response = await trpc.createSalesProspect.mutate(formData);
      // Update prospects list with explicit typing in setState callback
      setProspects((prev: SalesProspect[]) => [response, ...prev]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create prospect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProspect = async (updatedProspect: SalesProspect) => {
    setProspects((prev: SalesProspect[]) => 
      prev.map((p: SalesProspect) => p.id === updatedProspect.id ? updatedProspect : p)
    );
    setSelectedProspect(updatedProspect);
  };

  const handleDeleteProspect = async (id: number) => {
    try {
      await trpc.deleteSalesProspect.mutate({ id });
      setProspects((prev: SalesProspect[]) => prev.filter((p: SalesProspect) => p.id !== id));
      setSelectedProspect(null);
    } catch (error) {
      console.error('Failed to delete prospect:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('terbuka')) return 'status-terbuka';
    if (statusLower.includes('menang')) return 'status-menang';
    if (statusLower.includes('kalah')) return 'status-kalah';
    return 'status-terbuka';
  };

  const getPotensiBadgeClass = (potensi: string) => {
    const potensiLower = potensi.toLowerCase();
    if (potensiLower.includes('tinggi')) return 'potensi-tinggi';
    if (potensiLower.includes('sedang')) return 'potensi-sedang';
    if (potensiLower.includes('rendah')) return 'potensi-rendah';
    return 'potensi-sedang';
  };

  const getFollowUpBadgeClass = (followUp: string) => {
    const followUpLower = followUp.toLowerCase();
    if (followUpLower.includes('perlu')) return 'follow-up-perlu';
    if (followUpLower.includes('selesai')) return 'follow-up-selesai';
    if (followUpLower.includes('tertunda')) return 'follow-up-tertunda';
    return 'follow-up-perlu';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID');
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
      <div className="min-h-screen crm-gradient">
        <div className="container mx-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="border-gray-300"
              >
                ← Kembali
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Tambah Prospek Baru</h1>
            </div>
            
            <Card className="crm-card">
              <CardContent className="p-6">
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
    <div className="min-h-screen crm-gradient">
      {/* Header */}
      <div className="crm-header shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎯 CRM Sales Pipeline</h1>
              <p className="text-blue-100">Kelola dan pantau prospek penjualan Anda</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold">{prospects.length}</div>
                <div className="text-sm text-blue-100">Total Prospek</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Prospek</p>
                  <p className="text-3xl font-bold text-blue-600">{prospects.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Potensi Tinggi</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {prospects.filter((p: SalesProspect) => p.potensi.toLowerCase().includes('tinggi')).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Butuh Follow Up</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {prospects.filter((p: SalesProspect) => p.follow_up.toLowerCase().includes('perlu')).length}
                  </p>
                </div>
                <Phone className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Closing Menang</p>
                  <p className="text-3xl font-bold text-green-600">
                    {prospects.filter((p: SalesProspect) => p.status_closing.toLowerCase().includes('menang')).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Daftar Prospek</h2>
            <p className="text-gray-600">Kelola semua prospek penjualan Anda</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Prospek
          </Button>
        </div>

        {/* Prospects Grid */}
        {prospects.length === 0 ? (
          <Card className="crm-card">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada prospek</h3>
              <p className="text-gray-600 mb-6">Mulai dengan menambahkan prospek pertama Anda</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Prospek Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {prospects.map((prospect: SalesProspect) => (
              <Card 
                key={prospect.id} 
                className="crm-card hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedProspect(prospect)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {prospect.photo_url && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={prospect.photo_url} 
                            alt="Prospect" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {!prospect.photo_url && (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Prospek #{prospect.id}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={`status-badge ${getStatusBadgeClass(prospect.status_closing)}`}>
                            {prospect.status_closing}
                          </Badge>
                          <Badge className={`status-badge ${getPotensiBadgeClass(prospect.potensi)}`}>
                            Potensi {prospect.potensi}
                          </Badge>
                          <Badge className={`status-badge ${getFollowUpBadgeClass(prospect.follow_up)}`}>
                            FU {prospect.follow_up}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>FU Terakhir: {formatDate(prospect.tanggal_fu_terakhir)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>Respon Terakhir: {formatDate(prospect.date_last_respond)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>Dibuat: {formatDate(prospect.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      {prospect.online_meeting && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          📹 Online Meeting
                        </Badge>
                      )}
                      {prospect.survey_lokasi && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          📍 Survey Lokasi
                        </Badge>
                      )}
                      {prospect.blast_mingguan && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          📧 Blast Mingguan
                        </Badge>
                      )}
                    </div>
                  </div>

                  {prospect.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-2">{prospect.notes}</p>
                    </div>
                  )}
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