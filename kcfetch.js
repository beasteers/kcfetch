/*

<script src="https://cdn.jsdelivr.net/gh/beasteers/kcfetch/kcfetch.js"></script>
<script type="module">
    // Keycloak JS Adapter Reference:
    // https://www.keycloak.org/docs/latest/securing_apps/#javascript-adapter-reference
    import kcfetch from "https://cdn.jsdelivr.net/gh/beasteers/kcfetch/kcfetch.js";

    kcfetch.init({
        url: 'https://auth.myproject.com', // required
        clientId: 'my-app', // required
        realm: 'master', // default

        // options to pass to keycloak.init(). see js adapter reference above.
        initOptions: { onLoad: 'login-required' } // this is the default
        // if true (default), it will set `keycloak` and `kcfetch` as global variables.
        global: true,
    }).then((kcfetch, keycloak) => {
        // in here you can do whatever you want with the keycloak instance.
        keycloak.authenticated ? "hello friend" : "you're not logged in";
        // you can look at some tokens if you want.
        keycloak.token ? keycloak.tokenParsed : "hmm no token";
        keycloak.idToken ? keycloak.idTokenParsed : "hmm no id token";
        keycloak.refreshToken ? keycloak.refreshTokenParsed : "hmm no refresh token";
    })

    // you can just make requests to your API and it will automatically handle keycloak.
    kcfetch('https://api.myproject.com/api/data').then(...)

</script>
*/
// UMD
const kcfetch = ((root, factory) => {
    const mod = factory();
    if (typeof define === 'function' && define.amd) { // AMD
        define(['exports'], (exports) => { exports.kcfetch = mod });
    } else if (typeof module !== 'undefined' && typeof exports === 'object') { // CommonJS
        module.exports.kcfetch = mod;
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') { // CommonJS
        exports.kcfetch = mod;
    } else { // window
        root.kcfetch = mod
    }
    return mod;
})(typeof self !== 'undefined' ? self : this, () => {

/** 
* A promise to load a script.
* @param {string} url - The url of the script to load.
* @return {Promise} Evaluates true if the script was loaded, false if not.
*/
const insertScript = (url) => (
    new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = url;
        s.onload = () => resolve(s);
        s.onerror = reject;
        document.head.appendChild(s);
    }));

    
/** 
* Initializes a kcfetch function.
* @summary This is a callable that automatically handles keycloak authentication.
*/
const KcFetch = ({  }={}) => {
    const kcfetch = (url, options={}, refreshBuffer) => {
        return new Promise((resolve, reject) => {

            // first, check if the kcfetch has already been initialized.
            const initPromise = kcfetch.initialized;
            if(!initPromise) {
                return reject("You must call kcfetch.init({ url, clientId }) to point it to your Keycloak instance.");
            }

            // this is the function that makes the fetch request.
            const request = () => (
                kcfetch.keycloak.updateToken(refreshBuffer || kcfetch.refreshBuffer).then((refreshed) => {
                    fetch(url, {
                        ...options, headers: {...options.headers, Authorization: 'Bearer ' + kcfetch.keycloak.token}
                    }).then(resolve).catch(reject);
                }).catch((e) => { 
                    console.error('Failed to refresh token', e);
                })
            )

            // then just call the request function, possibly waiting for keycloak to initialize.
            const kc = kcfetch.keycloak;
            return kc && kc.initialized ? request() : initPromise.then(() => request());
        })
    }

    kcfetch.init = ({ 
        // define your keycloak instance
        url, 
        realm, 
        clientId, 
        initOptions={ onLoad: 'login-required' }, // options to pass to keycloak.init
        refreshBuffer=10, // the minimum time to expiration before refreshing token. Default is 10
        // appendAuth=false, // don't append /auth to the keycloak url (because you have already)
    }) => {
        realm = realm || 'master';
        kcfetch.url = url;
        kcfetch.realm = realm;
        kcfetch.clientId = clientId;

        // create the keycloak initialization promise.
        kcfetch.initialized = new Promise((resolve, reject) => {

            // prepare the url
            if(!url) { throw "You must specify a url pointing to your keycloak server. e.g. 'https://auth.myproject.com'" }
            // url = appendAuth ? url.replace(/\/$/, '') + '/auth' : url;
            kcfetch.refreshBuffer = refreshBuffer || kcfetch.refreshBuffer;
            
            // function to create the keycloak instance
            const create = () => {
                const keycloak = new Keycloak({ url, realm, clientId });//patchKeycloak();
                kcfetch.keycloak = keycloak;
                keycloak.init(initOptions).then(() => resolve(keycloak)).catch(reject);
            }

            // only load script if Keycloak is not already loaded
            window.Keycloak ? create() : insertScript(url + '/js/keycloak.js').then(create).catch(reject);
        })

        return kcfetch.initialized;
    };

    // how many seconds before expiration to refresh the token? 
    kcfetch.refreshBuffer = 10;
    // create new instance of kcfetch
    kcfetch.Factory = KcFetch;
    return kcfetch;
}

// create a new kcfetch function.
const kcfetch = KcFetch();
return kcfetch;
})
export default kcfetch;


// const params = new URLSearchParams((new URL(document.currentScript.src)).search);
// if(params.url) kcfetch.init(params);
