<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::with(['patient:id,name', 'doctor:id,name,specialty'])
            ->orderByDesc('appointment_date')
            ->orderByDesc('appointment_time');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($doctorId = $request->query('doctor_id')) {
            $query->where('doctor_id', $doctorId);
        }

        return response()->json(['appointments' => $query->get()]);
    }

    public function updateStatus(Request $request, Appointment $appointment): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,confirmed,completed,cancelled'],
        ]);

        $appointment->update($data);

        return response()->json([
            'appointment' => $appointment->load(['patient:id,name', 'doctor:id,name,specialty']),
        ]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'today' => Appointment::whereDate('appointment_date', today())->count(),
            'pending' => Appointment::where('status', 'pending')->count(),
            'confirmed' => Appointment::where('status', 'confirmed')->count(),
            'doctors' => User::where('role', 'doctor')->count(),
            'patients' => User::where('role', 'patient')->count(),
        ]);
    }
}
