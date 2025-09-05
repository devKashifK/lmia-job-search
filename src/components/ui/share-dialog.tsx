'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Share2,
  Link,
  Copy,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  MessageSquare,
} from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle?: string;
  employer?: string;
  city?: string;
  state?: string;
  url?: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  jobTitle = '',
  employer = '',
  city = '',
  state = '',
  url = '',
}: ShareDialogProps) {
  const [shareCopied, setShareCopied] = useState(false);

  const getCurrentJobUrl = () => {
    if (url) return url;
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  const copyJobLink = async () => {
    try {
      const currentUrl = getCurrentJobUrl();
      await navigator.clipboard.writeText(currentUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareOnSocialMedia = (platform: string) => {
    const currentUrl = getCurrentJobUrl();
    const title = `${jobTitle} at ${employer} - ${city}, ${state}`;
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(title);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=550,height=420');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-brand-600" />
            Share This Job
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="space-y-6 p-1">
            {/* Copy Link Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Link className="w-4 h-4 text-gray-600" />
                Copy Link
              </h4>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 truncate">
                    {getCurrentJobUrl()}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={copyJobLink}
                  className={`flex-shrink-0 transition-all duration-200 ${
                    shareCopied
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-brand-500 hover:bg-brand-600 text-white'
                  }`}
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Social Media Share Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">
                Share on Social Media
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => shareOnSocialMedia('facebook')}
                  className="flex items-center gap-2 p-3 h-auto hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Facebook</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => shareOnSocialMedia('twitter')}
                  className="flex items-center gap-2 p-3 h-auto hover:bg-sky-50 hover:border-sky-300 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-sky-500" />
                  <span className="text-sm font-medium">Twitter</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => shareOnSocialMedia('linkedin')}
                  className="flex items-center gap-2 p-3 h-auto hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-blue-700" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => shareOnSocialMedia('whatsapp')}
                  className="flex items-center gap-2 p-3 h-auto hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
