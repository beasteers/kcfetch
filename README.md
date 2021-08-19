# kcfetch
Use fetch with keycloak with vanilla JS

## Example
As simple as you can get!
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/beasteers/kcfetch/kcfetch.js"></script>
<script>
  withKeycloak({ url: 'https://auth.myproject.com', clientId: 'user' }).then((kcfetch) => {
      kcfetch('https://api.myproject.com/api/data')
          .then(r => r.json())
          .then((data) => console.log('yay!', data))
          .catch(console.error)
  })
</script>
```
### Alternative Methods
If you don't want everything to be inside the `withKeycloak` promise, you can 
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/beasteers/kcfetch/kcfetch.js"></script>
<script>
  // this only works when `global: true` (default)
  // adding `global: false` below will cause this method to stop working
  withKeycloak({ url: 'https://auth.myproject.com', clientId: 'user' })
  
  function getData = () => {
    if(!keycloakInitialized) { console.error("Our authorization token isn't ready yet..." }
    kcfetch('https://api.myproject.com/api/data')
          .then(r => r.json())
          .then((data) => console.log('yay!', data))
          .catch(console.error)
  }
</script>
```

## Reference

Keycloak JS Adapter Reference: [here](https://www.keycloak.org/docs/latest/securing_apps/#javascript-adapter-reference)

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/beasteers/kcfetch/kcfetch.js"></script>
<script>
  withKeycloak({
        url: 'https://auth.myproject.com', // the url pointing to keycloak. required
        clientId: 'my-frontend-app', // your keycloak's client ID (public). required
        realm: params.realm, // your keycloak realm. default: master

        // options to pass to keycloak.init(). see js adapter reference above.
        initOptions: { onLoad: 'login-required' } // this is the default
        global: true, // if true (default), `keycloak` and `kcfetch` will be set as global variables.
    }).then((kcfetch) => {
        // in here, keycloak is all ready to go!
        kcfetch('https://api.myproject.com/api/data')
          .then(r => r.json())
          .then((data) => console.log('yay!', data))
          .catch(console.error)
    })
</script>
```
