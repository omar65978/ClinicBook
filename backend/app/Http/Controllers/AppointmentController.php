<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    /**
     * Appointments of the logged-in patient.
     */
    public function myAppointments(Request $request): JsonResponse
    {
        $appointments = $request->user()
            ->patientAppointments()
            ->with('doctor:id,name,specialty')
            ->orderByDesc('appointment_date')
            ->orderByDesc('appointment_time')
            ->get();

        return response()->json(['appointments' => $appointments]);
    }

    /**
     * Book a new appointment (patient).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'doctor_id' => ['required', 'exists:users,id'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $doctor = User::findOrFail($data['doctor_id']);
        abort_unless($doctor->role === 'doctor', 422, 'Please choose a valid doctor.');

        // Prevent double booking: the same doctor, date and time cannot be booked twice.
        $taken = Appointment::where('doctor_id', $doctor->id)
            ->where('appointment_date', $data['appointment_date'])
            ->where('appointment_time', $data['appointment_time'])
            ->whereNotIn('status', ['cancelled'])
            ->exists();

        if ($taken) {
            throw ValidationException::withMessages([
                'appointment_time' => ['This slot is already booked. Please pick another time.'],
            ]);
        }

        $appointment = $request->user()->patientAppointments()->create([
            'doctor_id' => $doctor->id,
            'appointment_date' => $data['appointment_date'],
            'appointment_time' => $data['appointment_time'],
            'reason' => $data['reason'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'appointment' => $appointment->load('doctor:id,name,specialty'),
        ], 201);
    }

    /**
     * Cancel an appointment (patient, only while pending or confirmed).
     */
    public function cancel(Request $request, Appointment $appointment): JsonResponse
    {
        abort_if($appointment->patient_id !== $request->user()->id, 403, 'This appointment does not belong to you.');
        abort_if(! in_array($appointment->status, ['pending', 'confirmed']), 422, 'This appointment can no longer be cancelled.');

        $appointment->update(['status' => 'cancelled']);

        return response()->json(['appointment' => $appointment]);
    }

    /**
     * Schedule of the logged-in doctor.
     */
    public function doctorSchedule(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'doctor', 403, 'Only doctors have a schedule.');

        $appointments = $request->user()
            ->doctorAppointments()
            ->with('patient:id,name')
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get();

        return response()->json(['appointments' => $appointments]);
    }

    /**
     * Confirm or complete an appointment (doctor, own appointments only).
     */
    public function updateStatus(Request $request, Appointment $appointment): JsonResponse
    {
        abort_unless($request->user()->role === 'doctor', 403, 'Only doctors can update appointments.');
        abort_if($appointment->doctor_id !== $request->user()->id, 403, 'This appointment does not belong to you.');

        $data = $request->validate([
            'status' => ['required', 'in:confirmed,completed'],
        ]);

        $appointment->update($data);

        return response()->json([
            'appointment' => $appointment->load('patient:id,name'),
        ]);
    }
}
