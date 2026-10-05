<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DoctorController extends Controller
{
    public function index(): JsonResponse
    {
        $doctors = User::where('role', 'doctor')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'specialty', 'bio']);

        return response()->json(['doctors' => $doctors]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'specialty' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
        ]);

        $doctor = User::create([...$data, 'role' => 'doctor']);

        return response()->json(['doctor' => $doctor], 201);
    }

    public function update(Request $request, User $doctor): JsonResponse
    {
        abort_unless($doctor->role === 'doctor', 404, 'Doctor not found.');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($doctor->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'specialty' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
        ]);

        if (empty($data['password'])) {
            unset($data['password']); // keep the current password
        }

        $doctor->update($data);

        return response()->json(['doctor' => $doctor]);
    }

    public function destroy(User $doctor): JsonResponse
    {
        abort_unless($doctor->role === 'doctor', 404, 'Doctor not found.');

        $doctor->delete();

        return response()->json(['message' => 'Doctor deleted.']);
    }
}
