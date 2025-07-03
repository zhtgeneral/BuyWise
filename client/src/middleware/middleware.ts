
/**`
 * This function controls which routes are accessible without token
 */
export default function RedirectRoutes(path, navigate, isAuthenticated) {
  if (path === '/about' || path === "/") {
    navigate(path);
  } else if (!isAuthenticated) {
    navigate('/login', { state: { from: path } });
  } else {
    navigate(path);
  }
};