import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';

export const OsaComposition = ({ 
  scenes = [], 
  captions = 'off', 
  voiceEnabled = false,
  format = '16:9' 
}) => {
  const { width, height, fps } = useVideoConfig();
  
  // Calculate aspect ratio based on format
  const getDimensions = () => {
    switch (format) {
      case '9:16':
        return { width: 1080, height: 1920 };
      case '1:1':
        return { width: 1080, height: 1080 };
      case '16:9':
      default:
        return { width: 1920, height: 1080 };
    }
  };

  const dims = getDimensions();

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0f' }}>
      {scenes.length === 0 ? (
        // Default placeholder scene with OSA branding
        <Sequence durationInFrames={fps * 5}>
          <AbsoluteFill style={{ 
            justifyContent: 'center', 
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)'
          }}>
            <div style={{
              textAlign: 'center',
              color: '#FFD700',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              <h1 style={{ 
                fontSize: 48, 
                margin: '0 0 20px 0',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
              }}>
                OSA VIDEO DIRECTOR
              </h1>
              <p style={{ fontSize: 24, color: '#ffffff', opacity: 0.8 }}>
                Cinematic AI Reels
              </p>
              <div style={{ 
                marginTop: 40, 
                padding: '20px 40px',
                border: '2px solid #FFD700',
                borderRadius: 8,
                display: 'inline-block'
              }}>
                <span style={{ fontSize: 18, color: '#FFD700' }}>
                  Format: {format}
                </span>
              </div>
            </div>
          </AbsoluteFill>
        </Sequence>
      ) : (
        // Render scenes from the job
        scenes.map((scene, index) => (
          <Sequence
            key={scene.id || index}
            from={scenes
              .slice(0, index)
              .reduce(
                (total, previousScene) =>
                  total + (previousScene.durationInFrames || fps * 10),
                0
              )}
            durationInFrames={scene.durationInFrames || (fps * 10)}
            layout="none"
          >
            <SceneRenderer 
              scene={scene} 
              width={dims.width}
              height={dims.height}
              captions={captions}
            />
          </Sequence>
        ))
      )}
    </AbsoluteFill>
  );
};

const SceneRenderer = ({ scene, width, height, captions }) => {
  return (
    <AbsoluteFill style={{ 
      backgroundColor: scene.backgroundColor || '#0a0a0f',
      overflow: 'hidden'
    }}>
      {/* Background gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, 
          ${scene.colors?.primary || '#0a0a0f'} 0%, 
          ${scene.colors?.secondary || '#1a1a2e'} 100%)`
      }} />
      
      {/* Scene content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
        zIndex: 1
      }}>
        {scene.title && (
          <h2 style={{
            fontSize: 56,
            color: '#FFD700',
            margin: '0 0 30px 0',
            textAlign: 'center',
            textShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {scene.title}
          </h2>
        )}
        
        {scene.description && (
          <p style={{
            fontSize: 28,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.6,
            maxWidth: 1200,
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {scene.description}
          </p>
        )}
        
        {scene.visualElements && scene.visualElements.map((element, idx) => (
          <div key={idx} style={{
            marginTop: 20,
            padding: '15px 30px',
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: 8,
            color: '#FFD700',
            fontSize: 20
          }}>
            {element}
          </div>
        ))}
      </div>
      
      {/* Captions overlay */}
      {captions !== 'off' && scene.captions && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 60px',
          zIndex: 10
        }}>
          <div style={{
            display: 'inline-block',
            padding: captions === 'cinematic' ? '12px 24px' : '8px 16px',
            background: captions === 'cinematic' 
              ? 'rgba(0, 0, 0, 0.8)' 
              : 'rgba(0, 0, 0, 0.6)',
            borderRadius: captions === 'cinematic' ? 4 : 8,
            border: captions === 'cinematic' ? '1px solid rgba(255, 215, 0, 0.5)' : 'none'
          }}>
            <span style={{
              color: '#ffffff',
              fontSize: captions === 'cinematic' ? 32 : 28,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: captions === 'cinematic' ? 600 : 400,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
            }}>
              {scene.captions}
            </span>
          </div>
        </div>
      )}
      
      {/* Decorative elements - OSA style */}
      <div style={{
        position: 'absolute',
        top: 40,
        right: 40,
        width: 100,
        height: 100,
        border: '3px solid rgba(255, 215, 0, 0.3)',
        borderRadius: '50%',
        zIndex: 0
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: 40,
        left: 40,
        width: 60,
        height: 60,
        background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0
      }} />
    </AbsoluteFill>
  );
};
