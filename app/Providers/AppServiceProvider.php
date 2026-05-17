<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS on Railway
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        // Reset password URL
        ResetPassword::createUrlUsing(function ($user, string $token) {
            return 'https://noteapp-production-2bd5.up.railway.app/reset-password?token=' . $token . '&email=' . urlencode($user->email);
        });
    }
}