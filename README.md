# kcfetch
Use fetch with keycloak with vanilla JS or with React if you want!

All you need is:
 - a keycloak server
 - an API protected by keycloak that you want to query
 - a public client for this app

Then you just provide the keycloak *url* and the public *client ID* and you're good to go!

## Example
As simple as you can get!
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/beasteers/kcfetch/kcfetch.js"></script>
<script>
  kcfetch.init({ url: 'https://auth.myproject.com', clientId: 'myapp' })
  kcfetch('https://api.myproject.com/api/data')
        .then(r => r.json())
        .then((data) => console.log('yay!', data))
        .catch(console.error)
</script>
```

## Reference

Keycloak JS Adapter Reference: [here](https://www.keycloak.org/docs/latest/securing_apps/#javascript-adapter-reference)

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/beasteers/kcfetch/kcfetch.js"></script>
<script>
  kcfetch.init({
        url: 'https://auth.myproject.com', // the url pointing to keycloak. required
        clientId: 'my-app', // your keycloak's client ID (public). required
        realm: 'master', // your keycloak realm, optional. default: master

        // options to pass to keycloak.init(). see js adapter reference above.
        initOptions: { onLoad: 'login-required' } // this is the default
        // initOptions: { onLoad: 'check-sso' } // use this if you don't want to automatically redirect to the login page.
    }).then(keycloak => {
        // in here, keycloak is all ready to go!
        // you can access using either: keycloak or kcfetch.keycloak
    })
 
  // kcfetch will wait for the init promise internally if it was started,
  // meaning that kcfetch calls don't need to live inside the .then() call.
  // if .init() was not called, it will throw an error.
  kcfetch('https://api.myproject.com/api/data')
          .then(r => r.json())
          .then((data) => console.log('yay!', data))
          .catch(console.error)
</script>
```
