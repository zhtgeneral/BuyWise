
/**
 * Store the token in localStorage
 */
export function saveToBrowser(token) {
  localStorage.setItem('token', token); // TODO save using cookie
}