/*

<script src="cdn.blah.com/kcfetch.js"></script>
<script>
    // Keycloak JS Adapter Reference:
    // https://www.keycloak.org/docs/latest/securing_apps/#javascript-adapter-reference


    kcfetch.init({
        url: 'https://auth.myproject.com', // required
        clientId: 'my-app', // required
        realm: 'master', // default

        // options to pass to keycloak.init(). see js adapter reference above.
        initOptions: { onLoad: 'login-required' } // this is the default
        // if true (default), it will set `keycloak` and `kcfetch` as global variables.
        global: true,
    })

    kcfetch('https://api.myproject.com/api/data').then(...)


</script>
*/

(() => {

const insertScript = (path) => (
    new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = path;
        s.onload = () => resolve(s);
        s.onerror = reject;
        document.head.appendChild(s);
    }));

const newKcfetch = ({  }={}) => {
    const kcfetch = (url, options={}, refreshBuffer) => {
        return new Promise((resolve, reject) => {
            const initPromise = kcfetch._initPromise;
            if(!initPromise) {
                return reject("You must call kcfetch.init({ url, clientId }) to point it to your Keycloak instance.");
            }

            const request = () => (
                kcfetch.keycloak.updateToken(refreshBuffer || 10).then((refreshed) => {
                    fetch(url, {
                        ...options, headers: {...options.headers, Authorization: 'Bearer ' + kcfetch.keycloak.token}
                    }).then(resolve).catch(reject);
                }).catch((e) => { 
                    console.error('Failed to refresh token', e);
                })
            )
    
            const kc = kcfetch.keycloak;
            return kc && kc.initialized ? request() : initPromise.then(() => request());
        })
    }
    
    kcfetch.init = ({ 
        // define your keycloak instance
        url, realm, clientId, 
        initOptions={ onLoad: 'login-required' }, // options to pass to keycloak.init
        refreshBuffer, // the minimum time to expiration before refreshing token. Default is 10
        urlAsIs=false, // don't append /auth to the keycloak url (because you have already)
    }) => {
        kcfetch._initPromise = new Promise((resolve, reject) => {
            // prepare the url
            if(!url) { throw "You must specify a url pointing to your keycloak server. e.g. 'https://auth.myproject.com'" }
            url = urlAsIs ? url : url.replace(/\/$/, '') + '/auth';
            kcfetch.refreshBuffer = refreshBuffer || kcfetch.refreshBuffer;
            
            const create = () => {
                const keycloak = new Keycloak({ url, realm: realm || 'master', clientId });//patchKeycloak();
                kcfetch.keycloak = keycloak;
                keycloak.init(initOptions).then(() => resolve(kcfetch, keycloak)).catch(reject);
            }
            // if Keycloak is not already loaded
            window.Keycloak ? create() : insertScript(url + '/js/keycloak.js').then(create).catch(reject);
        })
        return kcfetch._initPromise;
    };

    kcfetch.Factory = newKcfetch;
    return kcfetch;
}

window.kcfetch = newKcfetch();

})()


// const params = new URLSearchParams((new URL(document.currentScript.src)).search);
// if(params.url) kcfetch.init(params);
