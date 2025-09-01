<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $table = 'items';
    protected $fillable = [
        'Id', 'Item', 'Nama Barang', 'Part Number', 'NSN', 'Serial #', 'Lokasi', 'Bin', 'Jenis', 'Kondisi (S/US)', 'Asset Group', 'Status', 'Site', 'Moved'
    ];
}
