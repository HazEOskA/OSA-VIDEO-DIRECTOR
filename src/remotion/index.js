import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { OsaComposition } from './OsaComposition.js';

const RemotionRoot = () => {
  return (
    <Composition
      id="OsaComposition"
      component={OsaComposition}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        scenes: [],
        captions: 'off',
        voiceEnabled: false,
        format: '16:9'
      }}
    />
  );
};

registerRoot(RemotionRoot);
