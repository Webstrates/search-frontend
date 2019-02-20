# Search Frontend

The Search Frontend is a plain webstrate that functions as a Google-like search page for a Webstrate server using the [Search Backend](https://github.com/Webstrates/search-backend)'s HTTP API.

Before setting up the Search Frontend to your Webstrates server, you'll need:

- An installation of the [Search Backend](https://github.com/Webstrates/search-backend), preferably [running behind an NGINX reverse proxy](https://github.com/Webstrates/search-backend#setting-up-nginx-reverse-proxy).
- [Webstrates File System (WFS)](https://www.npmjs.com/package/webstrates-file-system) for deploying the frontend to your server.

To set up:
- Clone this repository with `git` or [download a ZIP of the source code](https://github.com/Webstrates/search-backend/archive/master.zip) and unzip it.
- Navigate to the repository root.
- Run the following from the root directory:
```
wfs . --id=<webstrateId> --host=<serverHost> --ours --oneshot
```
Where `<webstrateId>` is the desired webstrateId of the search frontend (e.g. `search`) and `<serverHost>` is the host, including potential credentials and port number (e.g. `web:strate@domain.tld` or `localhost:7007`). If deploying to a server without HTTPS, append `--insecure` to the command. For more information on the usage of WFS, [see the WFS documentation](https://www.npmjs.com/package/webstrates-file-system).