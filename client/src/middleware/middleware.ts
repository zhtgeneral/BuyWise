const debug = true;

/**
 * This function controls which routes are accessible without token
 */
export default function RedirectRoutes(path, navigate, isAuthenticated) {
  debug? console.log("[middleware] is authenticated: ", isAuthenticated): '';
  /** 
   * Public routes 
   * /
   * /about
   */
  if (["/", "/about"].includes(path)) {
    navigate(path);
    return;
  } 
  /** 
   * Protected routes
   * /chat 
   * /chat/:chatId 
   * /explore-products 
   * /... any other route
   */
  if (!isAuthenticated) {
    navigate('/login', { 
      state: { 
        from: path 
      } 
    });
    return;
  } 

  navigate(path);
};