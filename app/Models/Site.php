<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Site extends Model
{
    protected $table = 'site';
    
    protected $fillable = [
        'Site',
        'Location'
    ];
    
    public $timestamps = false;
}
