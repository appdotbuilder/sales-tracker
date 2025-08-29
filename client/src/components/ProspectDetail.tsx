import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { trpc } from '@/utils/trpc';
import { useState, useRef } from 'react';
import { ArrowLeft, Edit3, Trash2, Camera, Upload, Calendar, Phone, FileText, Users } from 'lucide-react';
import type { SalesProspect, UpdateSalesProspectInput } from '../../../server/src/schema';

interface ProspectDetailProps {
  prospect: SalesProspect;
  onBack: () => void;
  onUpdate: (updatedProspect: SalesProspect) => void;
  onDelete: () => void;
}

export function ProspectDetail({ prospect, onBack, onUpdate, onDelete }: ProspectDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<UpdateSalesProspectInput>({
    id: prospect.id,
    follow_up: prospect.follow_up,
    tanggal_fu_terakhir: prospect.tanggal_fu_terakhir,
    date_last_respond: prospect.date_last_respond,
    potensi: prospect.potensi,
    online_meeting: prospect.online_meeting,
    survey_lokasi: prospect.survey_lokasi,
    status_closing: prospect.status_closing,
    notes: prospect.notes,
    blast_mingguan: prospect.blast_mingguan,
    photo_url: prospect.photo_url
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.updateSalesProspect.mutate(formData);
      onUpdate(response);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update prospect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        try {
          const response = await trpc.uploadPhoto.mutate({
            prospect_id: prospect.id,
            photo_data: base64Data,
            filename: file.name
          });
          onUpdate(response);
          setShowPhotoDialog(false);
        } catch (error) {
          console.error('Failed to upload photo:', error);
          alert('Failed to upload photo. Please try again.');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsUploadingPhoto(false);
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
    return new Date(date).toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateInput = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen crm-gradient">
      {/* Header */}
      <div className="crm-header shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">Detail Prospek #{prospect.id}</h1>
              <p className="text-blue-100">Informasi lengkap prospek penjualan</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setIsEditing(!isEditing)}
                className="text-white hover:bg-white/20"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? 'Batal Edit' : 'Edit'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-red-500/20">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus prospek ini? Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photo and Status Card */}
          <Card className="crm-card lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  {prospect.photo_url ? (
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 mx-auto">
                      <img 
                        src={prospect.photo_url} 
                        alt="Prospect" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto">
                      <Users className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                </div>
                
                <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      {prospect.photo_url ? 'Ganti Foto' : 'Upload Foto'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Foto Prospek</DialogTitle>
                      <DialogDescription>
                        Pilih file gambar untuk prospek ini. Maksimal ukuran file 5MB.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={isUploadingPhoto}
                      />
                      {isUploadingPhoto && (
                        <p className="text-sm text-blue-600">Mengupload foto...</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator />

              {/* Status Badges */}
              <div className="space-y-3">
                <Badge className={`status-badge ${getStatusBadgeClass(prospect.status_closing)} w-full justify-center`}>
                  Status: {prospect.status_closing}
                </Badge>
                <Badge className={`status-badge ${getPotensiBadgeClass(prospect.potensi)} w-full justify-center`}>
                  Potensi {prospect.potensi}
                </Badge>
                <Badge className={`status-badge ${getFollowUpBadgeClass(prospect.follow_up)} w-full justify-center`}>
                  Follow Up {prospect.follow_up}
                </Badge>
              </div>

              <Separator />

              {/* Boolean Fields */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Online Meeting</span>
                  <Badge variant={prospect.online_meeting ? "default" : "secondary"}>
                    {prospect.online_meeting ? '✅ Ya' : '❌ Tidak'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Survey Lokasi</span>
                  <Badge variant={prospect.survey_lokasi ? "default" : "secondary"}>
                    {prospect.survey_lokasi ? '✅ Ya' : '❌ Tidak'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Blast Mingguan</span>
                  <Badge variant={prospect.blast_mingguan ? "default" : "secondary"}>
                    {prospect.blast_mingguan ? '✅ Ya' : '❌ Tidak'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Information Card */}
          <Card className="crm-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {isEditing ? 'Edit Informasi' : 'Informasi Detail'}
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Ubah informasi prospek sesuai kebutuhan' : 'Detail lengkap tentang prospek ini'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Follow Up Status */}
                    <div className="space-y-2">
                      <Label>Status Follow Up *</Label>
                      <Select 
                        value={formData.follow_up || ''} 
                        onValueChange={(value) => setFormData((prev: UpdateSalesProspectInput) => ({ ...prev, follow_up: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Perlu">Perlu</SelectItem>
                          <SelectItem value="Selesai">Selesai</SelectItem>
                          <SelectItem value="Tertunda">Tertunda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Potensi */}
                    <div className="space-y-2">
                      <Label>Potensi *</Label>
                      <Select 
                        value={formData.potensi || ''} 
                        onValueChange={(value) => setFormData((prev: UpdateSalesProspectInput) => ({ ...prev, potensi: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tinggi">Tinggi</SelectItem>
                          <SelectItem value="Sedang">Sedang</SelectItem>
                          <SelectItem value="Rendah">Rendah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tanggal FU Terakhir */}
                    <div className="space-y-2">
                      <Label>Tanggal Follow Up Terakhir</Label>
                      <Input
                        type="date"
                        value={formatDateInput(formData.tanggal_fu_terakhir || null)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData((prev: UpdateSalesProspectInput) => ({
                            ...prev,
                            tanggal_fu_terakhir: e.target.value ? new Date(e.target.value) : null
                          }))
                        }
                      />
                    </div>

                    {/* Date Last Respond */}
                    <div className="space-y-2">
                      <Label>Tanggal Respon Terakhir</Label>
                      <Input
                        type="date"
                        value={formatDateInput(formData.date_last_respond || null)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData((prev: UpdateSalesProspectInput) => ({
                            ...prev,
                            date_last_respond: e.target.value ? new Date(e.target.value) : null
                          }))
                        }
                      />
                    </div>

                    {/* Status Closing */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Status Closing *</Label>
                      <Select 
                        value={formData.status_closing || ''} 
                        onValueChange={(value) => setFormData((prev: UpdateSalesProspectInput) => ({ ...prev, status_closing: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Terbuka">Terbuka</SelectItem>
                          <SelectItem value="Menang">Menang</SelectItem>
                          <SelectItem value="Kalah">Kalah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Boolean Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="online_meeting_edit"
                        checked={formData.online_meeting || false}
                        onCheckedChange={(checked) =>
                          setFormData((prev: UpdateSalesProspectInput) => ({ ...prev, online_meeting: !!checked }))
                        }
                      />
                      <Label htmlFor="online_meeting_edit" className="text-sm font-medium">
                        📹 Online Meeting
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="survey_lokasi_edit"
                        checked={formData.survey_lokasi || false}
                        onCheckedChange={(checked) =>
                          setFormData((prev: UpdateSalesProspectInput) => ({ ...prev, survey_lokasi: !!checked }))
                        }
                      />
                      <Label htmlFor="survey_lokasi_edit" className="text-sm font-medium">
                        📍 Survey Lokasi
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="blast_mingguan_edit"
                        checked={formData.blast_mingguan || false}
                        onCheckedChange={(checked) =>
                          setFormData((prev: UpdateSalesProspectInput) => ({ ...prev, blast_mingguan: !!checked }))
                        }
                      />
                      <Label htmlFor="blast_mingguan_edit" className="text-sm font-medium">
                        📧 Blast Mingguan
                      </Label>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Catatan</Label>
                    <Textarea
                      value={formData.notes || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData((prev: UpdateSalesProspectInput) => ({
                          ...prev,
                          notes: e.target.value || null
                        }))
                      }
                      className="min-h-[120px]"
                      placeholder="Tambahkan catatan untuk prospek ini..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Follow Up Terakhir</p>
                        <p className="text-blue-600">{formatDate(prospect.tanggal_fu_terakhir)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Respon Terakhir</p>
                        <p className="text-green-600">{formatDate(prospect.date_last_respond)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Notes */}
                  {prospect.notes && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Catatan</h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{prospect.notes}</p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Timestamps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Dibuat:</span> {formatDate(prospect.created_at)}
                    </div>
                    <div>
                      <span className="font-medium">Diperbarui:</span> {formatDate(prospect.updated_at)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}