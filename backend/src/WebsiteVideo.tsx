import React from 'react';
import { AbsoluteFill, IFrame, useCurrentFrame, interpolate } from 'remotion';

export interface WebsiteVideoProps {
  url?: string;
  duration?: number;
}

export const WebsiteVideo: React.FC<WebsiteVideoProps> = ({ 
  url = "https://remotion.dev", 
  duration = 300 
}) => {
  const frame = useCurrentFrame();
  
  // Ensure duration is a valid number
  const safeDuration = typeof duration === 'number' && !isNaN(duration) ? duration : 300;
  
  // Create a subtle zoom effect over time
  const scale = interpolate(frame, [0, safeDuration], [1, 1.05], {
    extrapolateRight: 'clamp',
  });

  // Ensure URL is valid
  const safeUrl = url && typeof url === 'string' ? url : "https://remotion.dev";

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        width: '100%',
        height: '100%',
      }}
    >
      <IFrame 
        src={safeUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        delayRenderTimeoutInMilliseconds={30000}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </AbsoluteFill>
  );
}; 