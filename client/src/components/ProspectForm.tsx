import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { User, Building2, Mail, Phone, DollarSign, FileText, AlertCircle } from 'lucide-react';

import type { CreateProspectInput, ProspectStatus, ProspectPriority } from '../../../server/src/schema';

interface ProspectFormProps {
  onSubmit: (data: CreateProspectInput) => Promise<void>;
  isLoading?: boolean;
}

export function ProspectForm({ onSubmit, isLoading = false }: ProspectFormProps) {
  const [formData, setFormData] = useState<CreateProspectInput>({
    first_name: '',
    last_name: '',
    email: '',
    phone: null,
    company: null,
    position: null,
    status: 'new',
    priority: 'medium',
    estimated_value: null,
    notes: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Nama depan wajib diisi';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nama belakang wajib diisi';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (formData.estimated_value !== null && formData.estimated_value <= 0) {
      newErrors.estimated_value = 'Nilai estimasi harus positif';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: null,
        company: null,
        position: null,
        status: 'new',
        priority: 'medium',
        estimated_value: null,
        notes: null
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium">Informasi Personal</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nama Depan *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProspectInput) => ({ ...prev, first_name: e.target.value }))
                }
                placeholder="Contoh: John"
                className={errors.first_name ? 'border-red-500' : ''}
              />
              {errors.first_name && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.first_name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Nama Belakang *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProspectInput) => ({ ...prev, last_name: e.target.value }))
                }
                placeholder="Contoh: Doe"
                className={errors.last_name ? 'border-red-500' : ''}
              />
              {errors.last_name && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.last_name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateProspectInput) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="john.doe@example.com"
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateProspectInput) => ({ 
                      ...prev, 
                      phone: e.target.value || null 
                    }))
                  }
                  placeholder="+62 812 3456 7890"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium">Informasi Perusahaan</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Perusahaan</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProspectInput) => ({ 
                    ...prev, 
                    company: e.target.value || null 
                  }))
                }
                placeholder="PT. Contoh Perusahaan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Posisi/Jabatan</Label>
              <Input
                id="position"
                value={formData.position || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProspectInput) => ({ 
                    ...prev, 
                    position: e.target.value || null 
                  }))
                }
                placeholder="Direktur, Manager, etc."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Information */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium">Informasi Penjualan</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status || 'new'} 
                onValueChange={(value: ProspectStatus) => 
                  setFormData((prev: CreateProspectInput) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioritas</Label>
              <Select 
                value={formData.priority || 'medium'} 
                onValueChange={(value: ProspectPriority) => 
                  setFormData((prev: CreateProspectInput) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Rendah</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                  <SelectItem value="urgent">Mendesak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_value">Nilai Estimasi ($)</Label>
              <Input
                id="estimated_value"
                type="number"
                value={formData.estimated_value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProspectInput) => ({ 
                    ...prev, 
                    estimated_value: e.target.value ? parseFloat(e.target.value) : null 
                  }))
                }
                placeholder="50000"
                min="0"
                step="100"
                className={errors.estimated_value ? 'border-red-500' : ''}
              />
              {errors.estimated_value && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.estimated_value}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium">Catatan</h3>
          </div>
          
          <div className="space-y-2">
            <Textarea
              value={formData.notes || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev: CreateProspectInput) => ({ 
                  ...prev, 
                  notes: e.target.value || null 
                }))
              }
              placeholder="Tambahkan catatan tentang prospek ini..."
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 flex-1">
          {isLoading ? 'Menyimpan...' : 'Simpan Prospek'}
        </Button>
      </div>
    </form>
  );
}