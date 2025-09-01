<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaksi1 extends Model
{
    protected $table = 'transaksi1';
    
    protected $fillable = [
        'invusenum',
        'bentuk',
        'nomer_dokumen',
        'tanggal_dokumen',
        'description',
        'gudang_asal',
        'gudang_tujuan',
        'status_transaksi',
        'sudah_diterima',
        'status_permintaan',
        'site',
        'assignment_status',
        'name',
        'jabatan',
        'create_date'
    ];
}
