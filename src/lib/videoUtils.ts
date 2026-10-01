
export interface ParsedVideoInfo {
  platform: "YOUTUBE" | "VIMEO" | "DIRECT" | "EXTERNAL";
  videoId?: string;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  directUrl?: string | null;
}

export function parseVideoUrl(rawUrl: string | null | undefined): ParsedVideoInfo | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  const url = rawUrl.trim();
  if (!url) return null;

  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = url.match(youtubeRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      platform: "YOUTUBE",
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  }

  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|))(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      platform: "VIMEO",
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`,
      thumbnailUrl: null,
    };
  }

  const isDirectVideo =
    /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url) ||
    url.startsWith("/uploads/portfolios/videos/");

  if (isDirectVideo) {
    return {
      platform: "DIRECT",
      embedUrl: null,
      directUrl: url,
      thumbnailUrl: null,
    };
  }

  return {
    platform: "EXTERNAL",
    embedUrl: url,
    directUrl: url,
    thumbnailUrl: null,
  };
}

export function captureVideoFrame(videoFile: File): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !videoFile) {
      resolve("");
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const fileUrl = URL.createObjectURL(videoFile);
    video.src = fileUrl;

    const cleanup = () => {
      URL.revokeObjectURL(fileUrl);
    };

    video.onloadeddata = () => {

      const seekTime = video.duration && !isNaN(video.duration)
        ? Math.min(1.5, video.duration * 0.25)
        : 0.5;
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxDim = 1280;
        let width = video.videoWidth || 1280;
        let height = video.videoHeight || 720;

        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
          cleanup();
          resolve(dataUrl);
          return;
        }
      } catch (err) {
        console.error("Frame capture error:", err);
      }
      cleanup();
      resolve("");
    };

    video.onerror = () => {
      cleanup();
      resolve("");
    };
  });
}
