<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'version' => '1.0.0',
    'docs' => 'REST API lives under /api — see README.md',
]));
