import React, { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and launched as standalone app, hide button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded border border-[#ffffff] bg-[#ffffff] text-[#0a0a0a] hover:bg-[#e0e0e0] active:scale-[0.98] transition-all font-mono"
        title="Install Radio Satie to your device for offline playback"
      >
        <Download className="h-3 w-3" />
        <span>INSTALL APP</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2 py-1 text-[10px] rounded border border-[#333333] bg-[#141414] text-[#cccccc] hover:text-[#ffffff] hover:border-[#555555] transition-colors font-mono"
          title="Add to Home Screen on iOS Safari"
        >
          <Download className="h-3 w-3" />
          <span>INSTALL ON IOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-mono">
            <div className="w-full max-w-sm rounded border border-[#333333] bg-[#101010] p-4 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                <span className="font-bold text-[#ffffff] uppercase tracking-wide flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5" /> INSTALL ON IPHONE / IPAD
                </span>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-[#666666] hover:text-[#ffffff]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-[#aaaaaa] leading-relaxed">
                <p>To use Radio Satie offline like a native app:</p>
                <div className="p-2.5 rounded bg-[#161616] border border-[#222222] space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#ffffff] font-bold">1.</span>
                    <span>Tap the <strong className="text-[#ffffff]">Share button</strong> (square with arrow) in Safari.</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#ffffff] font-bold">2.</span>
                    <span>Scroll down and select <strong className="text-[#ffffff]">Add to Home Screen</strong>.</span>
                  </div>
                </div>
                <p className="text-[10px] text-[#666666]">
                  The app will work with full offline audio synthesis even with no internet connection.
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-1.5 font-bold rounded bg-[#ffffff] text-[#0a0a0a] hover:bg-[#e0e0e0] transition-colors"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers that support install prompt directly or have ambient support
  return null;
};
