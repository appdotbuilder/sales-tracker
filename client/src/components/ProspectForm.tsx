import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
// Note the extra ../ because we're in components subfolder
import type { CreateSalesProspectInput } from '../../../server/src/schema';

interface ProspectFormProps {
  onSubmit: (data: CreateSalesProspectInput) => Promise<void>;
  isLoading?: boolean;
}

export function ProspectForm({ onSubmit, isLoading = false }: ProspectFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Follow Up Status */}
        <div className="space-y-2">
          <Label htmlFor="follow_up">Status Follow Up *</Label>
          <Select 
            value={formData.follow_up || ''} 
            onValueChange={(value) => setFormData((prev: CreateSalesProspectInput) => ({ ...prev, follow_up: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih status follow up" />
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
          <Label htmlFor="potensi">Potensi *</Label>
          <Select 
            value={formData.potensi || ''} 
            onValueChange={(value) => setFormData((prev: CreateSalesProspectInput) => ({ ...prev, potensi: value }))}
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

        {/* Tanggal FU Terakhir */}
        <div className="space-y-2">
          <Label htmlFor="tanggal_fu_terakhir">Tanggal Follow Up Terakhir</Label>
          <Input
            type="date"
            value={formData.tanggal_fu_terakhir ? new Date(formData.tanggal_fu_terakhir).toISOString().split('T')[0] : ''}
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
          <Label htmlFor="date_last_respond">Tanggal Respon Terakhir</Label>
          <Input
            type="date"
            value={formData.date_last_respond ? new Date(formData.date_last_respond).toISOString().split('T')[0] : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreateSalesProspectInput) => ({
                ...prev,
                date_last_respond: e.target.value ? new Date(e.target.value) : null
              }))
            }
          />
        </div>

        {/* Status Closing */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="status_closing">Status Closing *</Label>
          <Select 
            value={formData.status_closing || ''} 
            onValueChange={(value) => setFormData((prev: CreateSalesProspectInput) => ({ ...prev, status_closing: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih status closing" />
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
            id="online_meeting"
            checked={formData.online_meeting}
            onCheckedChange={(checked) =>
              setFormData((prev: CreateSalesProspectInput) => ({ ...prev, online_meeting: !!checked }))
            }
          />
          <Label htmlFor="online_meeting" className="text-sm font-medium">
            📹 Online Meeting
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="survey_lokasi"
            checked={formData.survey_lokasi}
            onCheckedChange={(checked) =>
              setFormData((prev: CreateSalesProspectInput) => ({ ...prev, survey_lokasi: !!checked }))
            }
          />
          <Label htmlFor="survey_lokasi" className="text-sm font-medium">
            📍 Survey Lokasi
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="blast_mingguan"
            checked={formData.blast_mingguan}
            onCheckedChange={(checked) =>
              setFormData((prev: CreateSalesProspectInput) => ({ ...prev, blast_mingguan: !!checked }))
            }
          />
          <Label htmlFor="blast_mingguan" className="text-sm font-medium">
            📧 Blast Mingguan
          </Label>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea
          placeholder="Tambahkan catatan untuk prospek ini..."
          value={formData.notes || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: CreateSalesProspectInput) => ({
              ...prev,
              notes: e.target.value || null
            }))
          }
          className="min-h-[100px]"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={isLoading || !formData.follow_up || !formData.potensi || !formData.status_closing}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan Prospek'}
        </Button>
      </div>
    </form>
  );
}