import { Auth0Provider } from '@auth0/auth0-react';

export const Auth0ProviderWithHistory = ({ children }) => {
    const domain = 'dev-rzymgcdpizdpp3pt.us.auth0.com';
    const clientId = 'xefmkcSCmwyxqpY8Vc0M0RGipUfJlmKC';

    const onRedirectCallback = (appState) => {
        // Use window.history.pushState or window.location
        window.history.replaceState({}, document.title, appState?.returnTo || window.location.pathname);
    };

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: window.location.origin,
            }}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
};