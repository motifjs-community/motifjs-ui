// An inline SVG sunset, so that the examples need no network access.
export const PICTURE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#3b5bdb"/><stop offset="1" stop-color="#f08c00"/></linearGradient></defs>' +
    '<rect width="320" height="160" fill="url(#sky)"/><circle cx="160" cy="112" r="34" fill="#ffd43b"/>' +
    '<path d="M0 118h320v42H0z" fill="#2b8a3e"/></svg>',
)}`;
