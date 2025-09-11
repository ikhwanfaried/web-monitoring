<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaksi2 extends Model
{
    protected $table = 'transaksi2';
    
    protected $fillable = [
        'usage',
        'nomor_dokumen',
        'tanggal_dokumen',
        'dasar',
        'part_number',
        'dari_gudang',
        'ke_gudang',
        'status_permintaan',
        'dipasang_di_no_reg_sista',
        'status_penerimaan',
        'status',
        'assignment_status',
        'assignee',
        'jabatan',
        'site'
    ];
}
