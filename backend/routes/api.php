<?php

use App\Http\Controllers\Admin\AppointmentController as AdminAppointmentController;
use App\Http\Controllers\Admin\DoctorController as AdminDoctorController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DoctorController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public directory of doctors
Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/{doctor}', [DoctorController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Patient
    Route::get('/appointments', [AppointmentController::class, 'myAppointments']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::patch('/appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);

    // Doctor
    Route::get('/doctor/appointments', [AppointmentController::class, 'doctorSchedule']);
    Route::patch('/doctor/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);

    // Admin
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/doctors', [AdminDoctorController::class, 'index']);
        Route::post('/doctors', [AdminDoctorController::class, 'store']);
        Route::put('/doctors/{doctor}', [AdminDoctorController::class, 'update']);
        Route::delete('/doctors/{doctor}', [AdminDoctorController::class, 'destroy']);

        Route::get('/appointments', [AdminAppointmentController::class, 'index']);
        Route::patch('/appointments/{appointment}/status', [AdminAppointmentController::class, 'updateStatus']);
        Route::get('/stats', [AdminAppointmentController::class, 'stats']);
    });
});
