<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'doctor')->orderBy('name');

        if ($specialty = $request->query('specialty')) {
            $query->where('specialty', $specialty);
        }

        return response()->json([
            'doctors' => $query->get(['id', 'name', 'specialty', 'bio']),
        ]);
    }

    public function show(User $doctor): JsonResponse
    {
        abort_unless($doctor->role === 'doctor', 404, 'Doctor not found.');

        return response()->json([
            'doctor' => $doctor->only(['id', 'name', 'specialty', 'bio']),
        ]);
    }
}
