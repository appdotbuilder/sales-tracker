import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import { Plus, Clock, Phone, Mail, Calendar, FileText, TrendingUp, MessageSquare, AlertCircle } from 'lucide-react';

import type { Activity, CreateActivityInput } from '../../../server/src/schema';

interface ActivityLogProps {
  prospectId: number;
  activities: Activity[];
  isLoading?: boolean;
  onActivityAdded: (activity: Activity) => void;
}

type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'status_change';

export function ActivityLog({ prospectId, activities, isLoading = false, onActivityAdded }: ActivityLogProps) {
  const [showForm, setShowForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateActivityInput>({
    prospect_id: prospectId,
    activity_type: 'note',
    title: '',
    description: null,
    activity_date: undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Judul aktivitas wajib diisi';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setFormSubmitting(true);
    try {
      const newActivity = await trpc.createActivity.mutate({
        ...formData,
        activity_date: formData.activity_date || new Date()
      });
      
      onActivityAdded(newActivity);
      
      // Reset form
      setFormData({
        prospect_id: prospectId,
        activity_type: 'note',
        title: '',
        description: null,
        activity_date: undefined
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create activity:', error);
    } finally {
      setFormSubmitting(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'note': return <MessageSquare className="h-4 w-4" />;
      case 'status_change': return <TrendingUp className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'call': return 'bg-green-100 text-green-800';
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'note': return 'bg-gray-100 text-gray-800';
      case 'status_change': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityLabel = (type: ActivityType) => {
    const labels = {
      'call': 'Telepon',
      'email': 'Email',
      'meeting': 'Meeting',
      'note': 'Catatan',
      'status_change': 'Perubahan Status'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat aktivitas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Activity Form */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Tambah Aktivitas
            </CardTitle>
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Aktivitas Baru
              </Button>
            )}
          </div>
        </CardHeader>
        
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activity_type">Jenis Aktivitas *</Label>
                  <Select 
                    value={formData.activity_type || 'note'} 
                    onValueChange={(value: ActivityType) => 
                      setFormData((prev: CreateActivityInput) => ({ ...prev, activity_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis aktivitas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Telepon
                        </div>
                      </SelectItem>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="meeting">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Meeting
                        </div>
                      </SelectItem>
                      <SelectItem value="note">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Catatan
                        </div>
                      </SelectItem>
                      <SelectItem value="status_change">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Perubahan Status
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity_date">Tanggal & Waktu</Label>
                  <Input
                    id="activity_date"
                    type="datetime-local"
                    value={formData.activity_date ? new Date(formData.activity_date).toISOString().slice(0, 16) : ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateActivityInput) => ({ 
                        ...prev, 
                        activity_date: e.target.value ? new Date(e.target.value) : undefined 
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Judul *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateActivityInput) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Contoh: Follow up telepon pertama, Demo produk, etc."
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.title}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev: CreateActivityInput) => ({ 
                      ...prev, 
                      description: e.target.value || null 
                    }))
                  }
                  placeholder="Detail aktivitas, hasil, tindak lanjut yang diperlukan..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setErrors({});
                    setFormData({
                      prospect_id: prospectId,
                      activity_type: 'note',
                      title: '',
                      description: null,
                      activity_date: undefined
                    });
                  }}
                  disabled={formSubmitting}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={formSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  {formSubmitting ? 'Menyimpan...' : 'Simpan Aktivitas'}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Riwayat Aktivitas ({activities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada aktivitas</h3>
              <p className="text-gray-600 mb-6">Mulai dengan menambahkan aktivitas pertama</p>
              {!showForm && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Aktivitas
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity: Activity, index: number) => (
                <div key={activity.id}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.activity_type)}`}>
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <Badge className={`text-xs ${getActivityColor(activity.activity_type)}`}>
                          {getActivityLabel(activity.activity_type)}
                        </Badge>
                      </div>
                      
                      {activity.description && (
                        <p className="text-gray-700 text-sm mb-2 whitespace-pre-wrap">
                          {activity.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {activity.activity_date.toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {activity.activity_date.toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {index < activities.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}