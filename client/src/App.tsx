import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Edit, Trash2, Users, TrendingUp, Calendar, Phone } from 'lucide-react';
// Using type-only import for better TypeScript compliance
import type { SalesProspect, CreateSalesProspectInput, UpdateSalesProspectInput } from '../../server/src/schema';

function App() {
  // Explicit typing with SalesProspect interface
  const [prospects, setProspects] = useState<SalesProspect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<SalesProspect | null>(null);

  // Form state with proper typing for nullable fields
  const [formData, setFormData] = useState<CreateSalesProspectInput>({
    follow_up: '',
    tanggal_fu_terakhir: null,
    date_last_respond: null,
    potensi: '',
    online_meeting: false,
    survey_lokasi: false,
    status_closing: '',
    notes: null,
    blast_mingguan: false
  });

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

  // Reset form function
  const resetForm = () => {
    setFormData({
      follow_up: '',
      tanggal_fu_terakhir: null,
      date_last_respond: null,
      potensi: '',
      online_meeting: false,
      survey_lokasi: false,
      status_closing: '',
      notes: null,
      blast_mingguan: false
    });
    setEditingProspect(null);
  };

  // Populate form for editing
  const handleEdit = (prospect: SalesProspect) => {
    setEditingProspect(prospect);
    setFormData({
      follow_up: prospect.follow_up,
      tanggal_fu_terakhir: prospect.tanggal_fu_terakhir,
      date_last_respond: prospect.date_last_respond,
      potensi: prospect.potensi,
      online_meeting: prospect.online_meeting,
      survey_lokasi: prospect.survey_lokasi,
      status_closing: prospect.status_closing,
      notes: prospect.notes,
      blast_mingguan: prospect.blast_mingguan
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingProspect) {
        // Update existing prospect
        const updateData: UpdateSalesProspectInput = {
          id: editingProspect.id,
          ...formData
        };
        const response = await trpc.updateSalesProspect.mutate(updateData);
        // Update prospects list with explicit typing in setState callback
        setProspects((prev: SalesProspect[]) => 
          prev.map(p => p.id === editingProspect.id ? response : p)
        );
      } else {
        // Create new prospect
        const response = await trpc.createSalesProspect.mutate(formData);
        // Update prospects list with explicit typing in setState callback
        setProspects((prev: SalesProspect[]) => [...prev, response]);
      }
      
      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save prospect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (prospectId: number) => {
    try {
      await trpc.deleteSalesProspect.mutate({ id: prospectId });
      setProspects((prev: SalesProspect[]) => prev.filter(p => p.id !== prospectId));
    } catch (error) {
      console.error('Failed to delete prospect:', error);
    }
  };

  // Helper function to get badge color based on status
  const getStatusBadgeColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('selesai') || lowerStatus.includes('menang')) return 'bg-green-100 text-green-800';
    if (lowerStatus.includes('tertunda') || lowerStatus.includes('kalah')) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getPotensiBadgeColor = (potensi: string) => {
    const lowerPotensi = potensi.toLowerCase();
    if (lowerPotensi.includes('tinggi')) return 'bg-green-100 text-green-800';
    if (lowerPotensi.includes('rendah')) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID');
  };

  // Convert date string to YYYY-MM-DD format for input
  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">📊 Sales Prospect Tracker</h1>
          </div>
          <p className="text-gray-600">Kelola dan lacak data prospek penjualan Anda dengan mudah</p>
        </div>

        {/* Add New Prospect Button */}
        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Prospek Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {editingProspect ? <Edit className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                  {editingProspect ? 'Edit Prospek' : 'Tambah Prospek Baru'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Follow Up */}
                  <div className="space-y-2">
                    <Label htmlFor="follow_up">Follow Up *</Label>
                    <Select 
                      value={formData.follow_up} 
                      onValueChange={(value: string) =>
                        setFormData((prev: CreateSalesProspectInput) => ({ ...prev, follow_up: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status follow up" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Perlu">Perlu</SelectItem>
                        <SelectItem value="Selesai">Selesai</SelectItem>
                        <SelectItem value="Tertunda">Tertunda</SelectItem>
                        <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Potensi */}
                  <div className="space-y-2">
                    <Label htmlFor="potensi">Potensi *</Label>
                    <Select 
                      value={formData.potensi} 
                      onValueChange={(value: string) =>
                        setFormData((prev: CreateSalesProspectInput) => ({ ...prev, potensi: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tingkat potensi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tinggi">Tinggi</SelectItem>
                        <SelectItem value="Sedang">Sedang</SelectItem>
                        <SelectItem value="Rendah">Rendah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Closing */}
                  <div className="space-y-2">
                    <Label htmlFor="status_closing">Status Closing *</Label>
                    <Select 
                      value={formData.status_closing} 
                      onValueChange={(value: string) =>
                        setFormData((prev: CreateSalesProspectInput) => ({ ...prev, status_closing: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status closing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Terbuka">Terbuka</SelectItem>
                        <SelectItem value="Menang">Menang</SelectItem>
                        <SelectItem value="Kalah">Kalah</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tanggal FU Terakhir */}
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_fu_terakhir">Tanggal FU Terakhir</Label>
                    <Input
                      type="date"
                      value={formatDateForInput(formData.tanggal_fu_terakhir)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateSalesProspectInput) => ({
                          ...prev,
                          tanggal_fu_terakhir: e.target.value ? new Date(e.target.value) : null
                        }))
                      }
                    />
                  </div>

                  {/* Date Last Respond */}
                  <div className="space-y-2">
                    <Label htmlFor="date_last_respond">Date Last Respond</Label>
                    <Input
                      type="date"
                      value={formatDateForInput(formData.date_last_respond)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateSalesProspectInput) => ({
                          ...prev,
                          date_last_respond: e.target.value ? new Date(e.target.value) : null
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Boolean Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Online Meeting */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="online_meeting"
                      checked={formData.online_meeting}
                      onCheckedChange={(checked: boolean) =>
                        setFormData((prev: CreateSalesProspectInput) => ({ ...prev, online_meeting: checked }))
                      }
                    />
                    <Label htmlFor="online_meeting">Online Meeting</Label>
                  </div>

                  {/* Survey Lokasi */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="survey_lokasi"
                      checked={formData.survey_lokasi}
                      onCheckedChange={(checked: boolean) =>
                        setFormData((prev: CreateSalesProspectInput) => ({ ...prev, survey_lokasi: checked }))
                      }
                    />
                    <Label htmlFor="survey_lokasi">Survey Lokasi</Label>
                  </div>

                  {/* Blast Mingguan */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="blast_mingguan"
                      checked={formData.blast_mingguan}
                      onCheckedChange={(checked: boolean) =>
                        setFormData((prev: CreateSalesProspectInput) => ({ ...prev, blast_mingguan: checked }))
                      }
                    />
                    <Label htmlFor="blast_mingguan">Blast Mingguan</Label>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Tambahkan catatan tambahan..."
                    value={formData.notes || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreateSalesProspectInput) => ({
                        ...prev,
                        notes: e.target.value || null
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Menyimpan...' : editingProspect ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Prospects List */}
        {prospects.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada prospek</h3>
            <p className="text-gray-500">Mulai tambahkan prospek pertama Anda!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prospects.map((prospect: SalesProspect) => (
              <Card key={prospect.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">Prospek #{prospect.id}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(prospect)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Prospek?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Aksi ini tidak dapat dibatalkan. Data prospek akan dihapus secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(prospect.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusBadgeColor(prospect.follow_up)}>
                      FU: {prospect.follow_up}
                    </Badge>
                    <Badge className={getPotensiBadgeColor(prospect.potensi)}>
                      {prospect.potensi}
                    </Badge>
                    <Badge className={getStatusBadgeColor(prospect.status_closing)}>
                      {prospect.status_closing}
                    </Badge>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">FU Terakhir:</span>
                      <span>{formatDate(prospect.tanggal_fu_terakhir)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Last Respond:</span>
                      <span>{formatDate(prospect.date_last_respond)}</span>
                    </div>
                  </div>

                  {/* Boolean Status */}
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Online Meeting:</span>
                      <span className={prospect.online_meeting ? 'text-green-600' : 'text-gray-400'}>
                        {prospect.online_meeting ? '✅ Ya' : '❌ Tidak'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Survey Lokasi:</span>
                      <span className={prospect.survey_lokasi ? 'text-green-600' : 'text-gray-400'}>
                        {prospect.survey_lokasi ? '✅ Ya' : '❌ Tidak'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blast Mingguan:</span>
                      <span className={prospect.blast_mingguan ? 'text-green-600' : 'text-gray-400'}>
                        {prospect.blast_mingguan ? '✅ Ya' : '❌ Tidak'}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {prospect.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 font-medium">Notes:</p>
                      <p className="text-sm text-gray-700 mt-1">{prospect.notes}</p>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="pt-2 border-t text-xs text-gray-400">
                    Dibuat: {formatDate(prospect.created_at)}
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