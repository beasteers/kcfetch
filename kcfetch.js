/*

<script src="cdn.blah.com/kcfetch.js"></script>
<script>
    // Keycloak JS Adapter Reference:
    // https://www.keycloak.org/docs/latest/securing_apps/#javascript-adapter-reference


    withKeycloak({
        url: 'https://auth.myproject.com', // required
        clientId: 'my-frontend-app', // required
        realm: params.realm, // default: master

        // options to pass to keycloak.init(). see js adapter reference above.
        initOptions: { onLoad: 'login-required' } // this is the default
        // if true (default), it will set `keycloak` and `kcfetch` as global variables.
        global: true,
    }).then((kcfetch) => {
        kcfetch(params)
    })


</script>
*/

const insertScript = (path) => (
    new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = path;
        s.onload = () => resolve(s);
        s.onerror = reject;
        document.head.appendChild(s);
    }));

const makeKcfetch = (keycloak, defaultRefreshBuffer) => {
    return (url, options={}, refreshBuffer) => (
        new Promise((resolve, reject) => {
            keycloak.updateToken(refreshBuffer || defaultRefreshBuffer || 10).then((refreshed) => {
                fetch(url, {
                    ...options, headers: {...options.headers, Authorization: 'Bearer ' + keycloak.token}
                }).then(resolve).catch(reject);
            }).catch((e) => { 
                console.error('Failed to refresh token', e); 
            });
        })
    )
}

const withKeycloak = ({ 
        // define your keycloak instance
        url, realm, clientId, 
        initOptions={ onLoad: 'login-required' }, // options to pass to keycloak.init
        refreshBuffer, // the minimum time to expiration before refreshing token. Default is 10
        global=true, // set to false if you don't want to define keycloak and kcfetch as global variables
        urlAsIs=false, // don't append /auth to the keycloak url (because you have already)
}) => new Promise((resolve, reject) => {
    // prepare the url
    if(!url) { throw "You must specify a url pointing to your keycloak server. e.g. 'https://auth.myproject.com'" }
    url = urlAsIs ? url : url.replace(/\/$/, '') + '/auth';


    const create = () => {
        const keycloak = new Keycloak({ url, realm: realm || 'master', clientId })
        const kcfetch = makeKcfetch(keycloak, refreshBuffer);
        if(global) {
            window.keycloak = keycloak;
            window.kcfetch = kcfetch;
        }

        keycloak.init(initOptions).then(() => {
            if(global) { window.keycloakInitialized = true; }
            resolve(kcfetch, keycloak);
        }).catch(reject);
    }
    // if Keycloak is not already loaded
    window.Keycloak ? create() : insertScript(url + '/js/keycloak.js').then(create).catch(reject);
});

const params = new URLSearchParams((new URL(document.currentScript.src)).search);
window.keycloakReady = params.url ? withKeycloak(params) : null;
