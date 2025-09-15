<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartLookup extends Model
{
    protected $table = 'part_lookup';
    
    protected $fillable = [
        'part_number',
        'nama_barang'
    ];
}
