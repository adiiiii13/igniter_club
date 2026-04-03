const TOTAL_FRAMES = 192;

const FRAME_SOURCES = [
  { dir: '/frames_hd', ext: 'webp' },
  { dir: '/frames_hd', ext: 'jpg' },
  { dir: '/frames', ext: 'webp' },
  { dir: '/frames', ext: 'jpg' },
];

const getFramePath = (index, source) => {
  const padded = String(index + 1).padStart(3, '0');
  return `${source.dir}/ezgif-frame-${padded}.${source.ext}`;
};

const probeSource = (source) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve(true);
  img.onerror = () => resolve(false);
  img.src = getFramePath(0, source);
});

const loadFrameFromSources = (index, sources) => new Promise((resolve) => {
  let sourceIndex = 0;

  const tryNextSource = () => {
    if (sourceIndex >= sources.length) {
      resolve(null);
      return;
    }

    const source = sources[sourceIndex];
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      sourceIndex += 1;
      tryNextSource();
    };
    img.src = getFramePath(index, source);
  };

  tryNextSource();
});

let cachedImages = null;
let preloadPromise = null;
let currentProgress = 0;
const progressListeners = new Set();

const notifyProgress = (progress) => {
  currentProgress = progress;
  progressListeners.forEach((listener) => {
    listener(progress);
  });
};

const getAvailableSources = async () => {
  const checks = await Promise.all(FRAME_SOURCES.map((source) => probeSource(source)));
  const available = FRAME_SOURCES.filter((_, idx) => checks[idx]);
  return available.length > 0 ? available : FRAME_SOURCES;
};

export const preloadAllFrames = (onProgress) => {
  if (onProgress) {
    progressListeners.add(onProgress);
    onProgress(currentProgress);
  }

  if (cachedImages) {
    notifyProgress(100);
    return Promise.resolve(cachedImages);
  }

  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = (async () => {
    notifyProgress(0);
    const sourcesToUse = await getAvailableSources();
    const images = new Array(TOTAL_FRAMES);
    let loadedCount = 0;

    await Promise.all(
      Array.from({ length: TOTAL_FRAMES }, async (_, i) => {
        const img = await loadFrameFromSources(i, sourcesToUse);
        images[i] = img;
        loadedCount += 1;
        notifyProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
      }),
    );

    cachedImages = images;
    notifyProgress(100);
    progressListeners.clear();
    return images;
  })();

  return preloadPromise;
};

export { TOTAL_FRAMES };
