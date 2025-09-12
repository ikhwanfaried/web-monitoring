<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dataset40200 extends Model
{
    protected $table = 'dataset40200';
    
    protected $fillable = [
        'usage',
        'nomor_dokumen',
        'tanggal_dokumen',
        'dasar',
        'part_number',
        'dari_gudang',
        'ke_gudang',
        'dipasang_di_no_reg_sista',
        'status_permintaan',
        'status_penerimaan',
        'status_pengiriman',
        'inbox_dokumen',
        'jabatan',
        'site',
        'assignment_status'
    ];
}
