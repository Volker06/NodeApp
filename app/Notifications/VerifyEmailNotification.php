<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends Notification
{
    use Queueable;

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $verifyUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Xác thực địa chỉ Email')
            ->greeting('Xin chào ' . $notifiable->name . '!')
            ->line('Nhấn vào nút bên dưới để xác thực địa chỉ email của bạn.')
            ->action('Xác thực Email', $verifyUrl)
            ->line('Liên kết này sẽ hết hạn sau 60 phút.')
            ->line('Nếu bạn không đăng ký tài khoản, hãy bỏ qua email này.');
    }

    protected function verificationUrl($notifiable): string
    {
        $frontendUrl = config('app.url');

        $signedUrl = URL::temporarySignedRoute(
            'api.verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        // Trích xuất query string từ signed URL
        $parsedUrl = parse_url($signedUrl);
        $query = $parsedUrl['query'] ?? '';

        return $frontendUrl . '/verify-email?' . $query . '&id=' . $notifiable->getKey() . '&hash=' . sha1($notifiable->getEmailForVerification());
    }
}