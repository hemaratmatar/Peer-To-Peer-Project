// Learners receive studentCount instead of the enrolled student list
export const studentCount = course => (
  typeof course.studentCount === 'number' ? course.studentCount : (course.students || []).length
);

// Extracts a YouTube video id; anything that is not an http(s) YouTube link returns null
export const youtubeVideoId = value => {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, '');
    let videoId = '';
    if (host === 'youtu.be') videoId = url.pathname.slice(1);
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      videoId = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
    }
    return /^[\w-]{6,20}$/.test(videoId) ? videoId : null;
  } catch (err) {
    return null;
  }
};
