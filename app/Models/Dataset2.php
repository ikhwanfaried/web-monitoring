<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dataset2 extends Model
{
    protected $table = 'dataset2';
    protected $primaryKey = 'Item ID';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'Item ID', 'Part Number', 'NSN', 'Nama Barang', 'PN Lama', 'Nama Lama', 'Gudang', 'Rak', 'Jumlah', 'Satuan', 'Harga Satuan', 'Komoditi', 'Komponen', 'Transaksi Terakhir', 'Lanud/Depo', 'Status', 'Keterangan'
    ];
}
