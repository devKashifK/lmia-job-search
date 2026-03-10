import { render } from '@react-email/render';
import { AuthConfirmationEmail } from './src/emails/auth-confirmation-template.tsx';
import fs from 'fs';

(async () => {
    const html = await render(<AuthConfirmationEmail />) as string;
    fs.writeFileSync('supabase-auth-template.html', html);
    console.log('Template generated at supabase-auth-template.html');
})();
