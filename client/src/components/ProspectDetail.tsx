import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Edit, Save, X, Trash2, User, Building2, Mail, Phone, DollarSign, FileText, Calendar, AlertCircle } from 'lucide-react';
import { PhotoUpload } from '@/components/PhotoUpload';
import { ActivityLog } from '@/components/ActivityLog';

import type { Prospect, UpdateProspectInput, ProspectStatus, ProspectPriority, Photo, Activity } from '../../../server/src/schema';

interface ProspectDetailProps {
  prospect: Prospect;
  onBack: () => void;
  onUpdate: (updatedProspect: Prospect) => void;
  onDelete: () => void;
}

export function ProspectDetail({ prospect, onBack, onUpdate, onDelete }: ProspectDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const [formData, setFormData] = useState<UpdateProspectInput>({
    id: prospect.id,
    first_name: prospect.first_name,
    last_name: prospect.last_name,
    email: prospect.email,
    phone: prospect.phone,
    company: prospect.company,
    position: prospect.position,
    status: prospect.status,
    priority: prospect.priority,
    estimated_value: prospect.estimated_value,
    notes: prospect.notes
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load photos for this prospect
  const loadPhotos = useCallback(async () => {
    try {
      const result = await trpc.getProspectPhotos.query({ prospectId: prospect.id });
      setPhotos(result);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setPhotosLoading(false);
    }
  }, [prospect.id]);

  // Load activities for this prospect
  const loadActivities = useCallback(async () => {
    try {
      const result = await trpc.getProspectActivities.query({ prospectId: prospect.id });
      setActivities(result);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  }, [prospect.id]);

  useEffect(() => {
    loadPhotos();
    loadActivities();
  }, [loadPhotos, loadActivities]);

  const handleUpdate = async () => {
    setErrors({});
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'Nama depan wajib diisi';
    }
    
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Nama belakang wajib diisi';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (formData.estimated_value !== null && formData.estimated_value !== undefined && formData.estimated_value <= 0) {
      newErrors.estimated_value = 'Nilai estimasi harus positif';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const updatedProspect = await trpc.updateProspect.mutate(formData);
      if (updatedProspect) {
        onUpdate(updatedProspect);
        setIsEditing(false);
      } else {
        console.error('Prospect not found');
      }
    } catch (error) {
      console.error('Failed to update prospect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      id: prospect.id,
      first_name: prospect.first_name,
      last_name: prospect.last_name,
      email: prospect.email,
      phone: prospect.phone,
      company: prospect.company,
      position: prospect.position,
      status: prospect.status,
      priority: prospect.priority,
      estimated_value: prospect.estimated_value,
      notes: prospect.notes
    });
    setErrors({});
    setIsEditing(false);
  };

  const handlePhotoUploaded = (newPhoto: Photo) => {
    setPhotos((prev: Photo[]) => [newPhoto, ...prev]);
  };

  const handlePhotoDeleted = async (photoId: number) => {
    try {
      await trpc.deletePhoto.mutate({ photoId });
      setPhotos((prev: Photo[]) => prev.filter((photo: Photo) => photo.id !== photoId));
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {prospect.first_name} {prospect.last_name}
                </h1>
                <p className="text-gray-600">Detail Prospek #{prospect.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Prospek</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus prospek {prospect.first_name} {prospect.last_name}? 
                          Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                          Ya, Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    size="sm"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Button>
                  <Button 
                    onClick={handleUpdate}
                    size="sm"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detail Informasi</TabsTrigger>
                <TabsTrigger value="photos">Foto ({photos.length})</TabsTrigger>
                <TabsTrigger value="activities">Aktivitas ({activities.length})</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informasi Personal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">Nama Depan *</Label>
                        {isEditing ? (
                          <>
                            <Input
                              id="first_name"
                              value={formData.first_name || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFormData((prev: UpdateProspectInput) => ({ ...prev, first_name: e.target.value }))
                              }
                              className={errors.first_name ? 'border-red-500' : ''}
                            />
                            {errors.first_name && (
                              <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.first_name}
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-900 font-medium mt-1">{prospect.first_name}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="last_name">Nama Belakang *</Label>
                        {isEditing ? (
                          <>
                            <Input
                              id="last_name"
                              value={formData.last_name || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFormData((prev: UpdateProspectInput) => ({ ...prev, last_name: e.target.value }))
                              }
                              className={errors.last_name ? 'border-red-500' : ''}
                            />
                            {errors.last_name && (
                              <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.last_name}
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-900 font-medium mt-1">{prospect.last_name}</p>
                        )}
                      </div>

                      <div>
                        <Label>Email *</Label>
                        {isEditing ? (
                          <>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setFormData((prev: UpdateProspectInput) => ({ ...prev, email: e.target.value }))
                                }
                                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                              />
                            </div>
                            {errors.email && (
                              <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.email}
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {prospect.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label>Nomor Telepon</Label>
                        {isEditing ? (
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              value={formData.phone || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFormData((prev: UpdateProspectInput) => ({ ...prev, phone: e.target.value || null }))
                              }
                              className="pl-10"
                            />
                          </div>
                        ) : (
                          <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {prospect.phone || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Company Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Informasi Perusahaan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Perusahaan</Label>
                        {isEditing ? (
                          <Input
                            value={formData.company || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setFormData((prev: UpdateProspectInput) => ({ ...prev, company: e.target.value || null }))
                            }
                          />
                        ) : (
                          <p className="text-gray-900 font-medium mt-1">{prospect.company || '-'}</p>
                        )}
                      </div>

                      <div>
                        <Label>Posisi/Jabatan</Label>
                        {isEditing ? (
                          <Input
                            value={formData.position || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setFormData((prev: UpdateProspectInput) => ({ ...prev, position: e.target.value || null }))
                            }
                          />
                        ) : (
                          <p className="text-gray-900 font-medium mt-1">{prospect.position || '-'}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Informasi Penjualan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Status</Label>
                        {isEditing ? (
                          <Select 
                            value={formData.status || 'new'} 
                            onValueChange={(value: ProspectStatus) => 
                              setFormData((prev: UpdateProspectInput) => ({ ...prev, status: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Baru</SelectItem>
                              <SelectItem value="contacted">Dihubungi</SelectItem>
                              <SelectItem value="qualified">Terkualifikasi</SelectItem>
                              <SelectItem value="proposal">Proposal</SelectItem>
                              <SelectItem value="negotiation">Negosiasi</SelectItem>
                              <SelectItem value="closed_won">Menang</SelectItem>
                              <SelectItem value="closed_lost">Kalah</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1">
                            <Badge variant={getStatusBadgeVariant(prospect.status)}>
                              {getStatusLabel(prospect.status)}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Prioritas</Label>
                        {isEditing ? (
                          <Select 
                            value={formData.priority || 'medium'} 
                            onValueChange={(value: ProspectPriority) => 
                              setFormData((prev: UpdateProspectInput) => ({ ...prev, priority: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Rendah</SelectItem>
                              <SelectItem value="medium">Sedang</SelectItem>
                              <SelectItem value="high">Tinggi</SelectItem>
                              <SelectItem value="urgent">Mendesak</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1">
                            <Badge className={`text-xs ${getPriorityBadgeColor(prospect.priority)}`}>
                              {getPriorityLabel(prospect.priority)}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Nilai Estimasi ($)</Label>
                        {isEditing ? (
                          <>
                            <Input
                              type="number"
                              value={formData.estimated_value || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFormData((prev: UpdateProspectInput) => ({ 
                                  ...prev, 
                                  estimated_value: e.target.value ? parseFloat(e.target.value) : null 
                                }))
                              }
                              min="0"
                              step="100"
                              className={errors.estimated_value ? 'border-red-500' : ''}
                            />
                            {errors.estimated_value && (
                              <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.estimated_value}
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-900 font-medium mt-1">
                            {prospect.estimated_value ? `$${prospect.estimated_value.toLocaleString()}` : '-'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Catatan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={formData.notes || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setFormData((prev: UpdateProspectInput) => ({ ...prev, notes: e.target.value || null }))
                        }
                        rows={4}
                        className="resize-none"
                      />
                    ) : (
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {prospect.notes || 'Tidak ada catatan'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value="photos">
                <PhotoUpload 
                  prospectId={prospect.id}
                  photos={photos}
                  onPhotoUploaded={handlePhotoUploaded}
                  onPhotoDeleted={handlePhotoDeleted}
                  isLoading={photosLoading}
                />
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities">
                <ActivityLog 
                  prospectId={prospect.id}
                  activities={activities}
                  isLoading={activitiesLoading}
                  onActivityAdded={(activity: Activity) => setActivities((prev: Activity[]) => [activity, ...prev])}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Info Singkat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl mb-3">
                    {prospect.first_name.charAt(0)}{prospect.last_name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {prospect.first_name} {prospect.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{prospect.company || 'No Company'}</p>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={getStatusBadgeVariant(prospect.status)} className="text-xs">
                      {getStatusLabel(prospect.status)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prioritas:</span>
                    <Badge className={`text-xs ${getPriorityBadgeColor(prospect.priority)}`}>
                      {getPriorityLabel(prospect.priority)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nilai:</span>
                    <span className="font-medium">
                      {prospect.estimated_value ? `$${prospect.estimated_value.toLocaleString()}` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dibuat:</span>
                    <span className="font-medium">
                      {prospect.created_at.toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {prospect.email && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(`mailto:${prospect.email}`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Kirim Email
                  </Button>
                )}
                {prospect.phone && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(`tel:${prospect.phone}`)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Telepon
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {/* Add calendar integration */}}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Jadwalkan Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}