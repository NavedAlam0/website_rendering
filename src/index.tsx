import { registerRoot, Composition } from 'remotion';
import { WebsiteVideo } from './WebsiteVideo';

registerRoot(() => (
  <Composition
    id="WebsiteVideo"
    component={WebsiteVideo}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{
      url: "https://remotion.dev",
      duration: 300
    }}
  />
));