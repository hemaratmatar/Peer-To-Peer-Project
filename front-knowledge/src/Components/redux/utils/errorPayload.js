// Normalises an axios error, including network errors that have no response
const errorPayload = err => ({
  msg: err.response ? err.response.statusText : err.message,
  status: err.response ? err.response.status : 500
});

// First human-readable message from an API error response
export const errorMessage = (err, fallback) => {
  const data = err && err.response && err.response.data;
  if (data && data.errors && data.errors.length) return data.errors[0].msg;
  if (data && data.msg) return data.msg;
  return fallback;
};

export default errorPayload;
