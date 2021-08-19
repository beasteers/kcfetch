# kcfetch
Use fetch with keycloak with vanilla JS

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
        // keycloak.js expects a url like: `https://auth.myproject.com/auth`.
        // but I think that's annoying to add so I append `/auth` internally.
        // if you don't want that, set this to true
        urlAsIs: false,
    }).then((kcfetch) => {
        // in here, keycloak is all ready to go!
        
    })
 
  kcfetch('https://api.myproject.com/api/data')
          .then(r => r.json())
          .then((data) => console.log('yay!', data))
          .catch(console.error)
</script>
```
